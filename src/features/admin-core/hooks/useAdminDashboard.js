import { useCallback, useEffect, useMemo, useState } from "react";
import { lowStockApi } from "../../../api/lowStockApi";
import { partsApi } from "../../../api/partsApi";
import { reportApi } from "../../../api/reportApi";
import { staffApi } from "../../../api/staffApi";
import { vendorApi } from "../../../api/vendorApi";
import { getApiMessage, getErrorMessage, toArray, unwrapApiResponse } from "../../../api/apiResult";

const REPORT_PERIODS = ["daily", "monthly", "yearly"];

function asNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeReport(rawReport) {
  if (!rawReport || typeof rawReport !== "object") {
    return {
      periodType: "",
      purchaseInvoiceCount: 0,
      totalPurchaseAmount: 0,
      salesInvoiceCount: 0,
      totalSalesAmount: 0,
      netAmount: 0,
      periodStartUtc: "",
      periodEndUtc: "",
    };
  }

  return {
    periodType: String(rawReport.periodType ?? rawReport.PeriodType ?? "").toLowerCase(),
    purchaseInvoiceCount: asNumber(
      rawReport.purchaseInvoiceCount ?? rawReport.PurchaseInvoiceCount
    ),
    totalPurchaseAmount: asNumber(rawReport.totalPurchaseAmount ?? rawReport.TotalPurchaseAmount),
    salesInvoiceCount: asNumber(rawReport.salesInvoiceCount ?? rawReport.SalesInvoiceCount),
    totalSalesAmount: asNumber(rawReport.totalSalesAmount ?? rawReport.TotalSalesAmount),
    netAmount: asNumber(rawReport.netAmount ?? rawReport.NetAmount),
    periodStartUtc: rawReport.periodStartUtc ?? rawReport.PeriodStartUtc ?? "",
    periodEndUtc: rawReport.periodEndUtc ?? rawReport.PeriodEndUtc ?? "",
  };
}

function normalizeAlert(rawAlert) {
  return {
    alertId: rawAlert?.alertId ?? rawAlert?.AlertId ?? "",
    partId: rawAlert?.partId ?? rawAlert?.PartId ?? "",
    partName: rawAlert?.partName ?? rawAlert?.PartName ?? "Unnamed part",
    currentStockQuantity: asNumber(
      rawAlert?.currentStockQuantity ?? rawAlert?.CurrentStockQuantity
    ),
    threshold: asNumber(rawAlert?.threshold ?? rawAlert?.Threshold, 10),
    notifiedAtUtc: rawAlert?.notifiedAtUtc ?? rawAlert?.NotifiedAtUtc ?? "",
    isAcknowledged: Boolean(rawAlert?.isAcknowledged ?? rawAlert?.IsAcknowledged),
  };
}

function countFromSettled(result) {
  if (result.status !== "fulfilled") {
    return null;
  }

  try {
    return toArray(unwrapApiResponse(result.value)).length;
  } catch {
    return null;
  }
}

export function useAdminDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("daily");
  const [reportsByPeriod, setReportsByPeriod] = useState(() => ({
    daily: normalizeReport({ periodType: "daily" }),
    monthly: normalizeReport({ periodType: "monthly" }),
    yearly: normalizeReport({ periodType: "yearly" }),
  }));
  const [thresholdInput, setThresholdInput] = useState("10");
  const [alerts, setAlerts] = useState([]);
  const [inventoryCounts, setInventoryCounts] = useState({
    parts: null,
    vendors: null,
    staff: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [acknowledgingAlertId, setAcknowledgingAlertId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [lastUpdatedAt, setLastUpdatedAt] = useState("");

  const threshold = Math.max(1, Math.floor(asNumber(thresholdInput, 10)));

  const fetchDashboardData = useCallback(
    async ({ scan = false, showMessage = false } = {}) => {
      const [reportsResult, lowStockResult, partsResult, vendorsResult, staffResult] =
        await Promise.allSettled([
          Promise.all(REPORT_PERIODS.map((period) => reportApi.financial(period))),
          lowStockApi.list({ scan, threshold }),
          partsApi.list(),
          vendorApi.list(),
          staffApi.getAll(),
        ]);

      let partialFailures = 0;

      if (reportsResult.status === "fulfilled") {
        try {
          const nextReports = {};
          reportsResult.value.forEach((response, index) => {
            const period = REPORT_PERIODS[index];
            nextReports[period] = normalizeReport(unwrapApiResponse(response));
          });
          setReportsByPeriod(nextReports);
        } catch {
          partialFailures += 1;
        }
      } else {
        partialFailures += 1;
      }

      if (lowStockResult.status === "fulfilled") {
        try {
          const response = lowStockResult.value;
          const rawAlerts = unwrapApiResponse(response);
          const normalizedAlerts = toArray(rawAlerts).map(normalizeAlert);
          setAlerts(normalizedAlerts);

          if (showMessage) {
            const fallbackMessage = scan
              ? "Dashboard refreshed and low stock scan completed."
              : "Dashboard refreshed.";
            setMessage(getApiMessage(response, fallbackMessage));
          }
        } catch {
          partialFailures += 1;
        }
      } else {
        partialFailures += 1;
      }

      const counts = {
        parts: countFromSettled(partsResult),
        vendors: countFromSettled(vendorsResult),
        staff: countFromSettled(staffResult),
      };

      if (counts.parts === null || counts.vendors === null || counts.staff === null) {
        partialFailures += 1;
      }

      setInventoryCounts(counts);
      setLastUpdatedAt(new Date().toISOString());

      if (partialFailures > 0) {
        setError("Some dashboard widgets could not load. You can still use the available data.");
      } else {
        setError("");
      }
    },
    [threshold]
  );

  useEffect(() => {
    let mounted = true;

    const initializeDashboard = async () => {
      setIsLoading(true);
      setError("");
      setMessage("");

      try {
        await fetchDashboardData({ scan: true, showMessage: false });
      } catch (requestError) {
        if (!mounted) {
          return;
        }
        setError(getErrorMessage(requestError, "Failed to load dashboard data."));
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    void initializeDashboard();

    return () => {
      mounted = false;
    };
  }, [fetchDashboardData]);

  const refreshDashboard = useCallback(async () => {
    setIsRefreshing(true);
    setError("");
    setMessage("");

    try {
      await fetchDashboardData({ scan: false, showMessage: true });
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Failed to refresh dashboard data."));
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchDashboardData]);

  const scanLowStockNow = useCallback(async () => {
    setIsScanning(true);
    setError("");
    setMessage("");

    try {
      const response = await lowStockApi.list({ scan: true, threshold });
      const rawAlerts = unwrapApiResponse(response);
      setAlerts(toArray(rawAlerts).map(normalizeAlert));
      setMessage(getApiMessage(response, "Low stock scan complete."));
      setLastUpdatedAt(new Date().toISOString());
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Failed to scan low stock alerts."));
    } finally {
      setIsScanning(false);
    }
  }, [threshold]);

  const acknowledgeAlert = useCallback(async (alertId) => {
    setAcknowledgingAlertId(alertId);
    setError("");
    setMessage("");

    try {
      const response = await lowStockApi.acknowledge(alertId);
      setMessage(getApiMessage(response, "Low stock alert acknowledged."));

      const refreshed = await lowStockApi.list({ scan: false, threshold });
      setAlerts(toArray(unwrapApiResponse(refreshed)).map(normalizeAlert));
      setLastUpdatedAt(new Date().toISOString());
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Failed to acknowledge low stock alert."));
    } finally {
      setAcknowledgingAlertId("");
    }
  }, [threshold]);

  const setThreshold = useCallback((value) => {
    const next = String(value ?? "").replace(/[^\d]/g, "");
    setThresholdInput(next);
  }, []);

  const activeReport = useMemo(
    () => reportsByPeriod[selectedPeriod] ?? normalizeReport({ periodType: selectedPeriod }),
    [reportsByPeriod, selectedPeriod]
  );

  const openAlerts = useMemo(
    () => alerts.filter((alert) => !alert.isAcknowledged),
    [alerts]
  );

  useEffect(() => {
    if (!message) {
      return;
    }

    const timer = window.setTimeout(() => {
      setMessage("");
    }, 3200);

    return () => {
      window.clearTimeout(timer);
    };
  }, [message]);

  return {
    selectedPeriod,
    setSelectedPeriod,
    reportsByPeriod,
    activeReport,
    threshold: thresholdInput,
    thresholdValue: threshold,
    setThreshold,
    alerts,
    openAlerts,
    inventoryCounts,
    isLoading,
    isRefreshing,
    isScanning,
    acknowledgingAlertId,
    error,
    message,
    lastUpdatedAt,
    refreshDashboard,
    scanLowStockNow,
    acknowledgeAlert,
  };
}
