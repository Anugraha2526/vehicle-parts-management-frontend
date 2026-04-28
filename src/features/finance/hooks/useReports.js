import { useCallback, useEffect, useState } from "react";
import { reportApi } from "../../../api/reportApi";
import { getApiMessage, getErrorMessage, unwrapApiResponse } from "../../../api/apiResult";

export const FINANCIAL_REPORT_TYPES = ["daily", "monthly", "yearly"];

function asNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeReport(rawReport) {
  if (!rawReport || typeof rawReport !== "object") {
    return null;
  }

  return {
    periodType: rawReport.periodType ?? rawReport.PeriodType ?? "",
    periodStartUtc: rawReport.periodStartUtc ?? rawReport.PeriodStartUtc ?? "",
    periodEndUtc: rawReport.periodEndUtc ?? rawReport.PeriodEndUtc ?? "",
    purchaseInvoiceCount: asNumber(
      rawReport.purchaseInvoiceCount ?? rawReport.PurchaseInvoiceCount
    ),
    totalPurchaseAmount: asNumber(rawReport.totalPurchaseAmount ?? rawReport.TotalPurchaseAmount),
    salesInvoiceCount: asNumber(rawReport.salesInvoiceCount ?? rawReport.SalesInvoiceCount),
    totalSalesAmount: asNumber(rawReport.totalSalesAmount ?? rawReport.TotalSalesAmount),
    netAmount: asNumber(rawReport.netAmount ?? rawReport.NetAmount),
  };
}

export function useReports() {
  const [reportType, setReportType] = useState("daily");
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchReport = useCallback(async (nextType) => {
    const normalizedType = String(nextType || "daily").toLowerCase();

    if (!FINANCIAL_REPORT_TYPES.includes(normalizedType)) {
      setError("Invalid report type selected.");
      return;
    }

    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await reportApi.financial(normalizedType);
      const responseData = unwrapApiResponse(response);

      setReport(normalizeReport(responseData));
      setMessage(getApiMessage(response, "Financial report generated."));
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Failed to load financial report."));
      setReport(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchReport(reportType);
  }, [fetchReport, reportType]);

  const changeReportType = useCallback((nextType) => {
    setReportType(nextType);
  }, []);

  const refresh = useCallback(() => {
    return fetchReport(reportType);
  }, [fetchReport, reportType]);

  return {
    reportType,
    setReportType: changeReportType,
    report,
    isLoading,
    error,
    message,
    refresh,
  };
}
