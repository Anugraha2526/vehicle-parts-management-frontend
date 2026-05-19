import { useCallback, useEffect, useState } from "react";
import { lowStockApi } from "../../../api/lowStockApi";
import { getApiMessage, getErrorMessage, toArray, unwrapApiResponse } from "../../../api/apiResult";

function asNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
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

export function useLowStock() {
  const [alerts, setAlerts] = useState([]);
  const [thresholdInput, setThresholdInput] = useState("10");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [acknowledgingAlertId, setAcknowledgingAlertId] = useState("");

  const threshold = Math.max(1, Math.floor(asNumber(thresholdInput, 10)));

  const fetchAlerts = useCallback(async (scan = true, options = {}) => {
    const { showMessage = false, preserveMessage = false } = options;
    setIsLoading(true);
    setError("");
    if (!preserveMessage) {
      setMessage("");
    }

    try {
      const response = await lowStockApi.list({
        scan,
        threshold,
      });

      const responseData = unwrapApiResponse(response);
      const normalizedAlerts = toArray(responseData).map(normalizeAlert);

      setAlerts(normalizedAlerts);
      if (showMessage) {
        setMessage(
          getApiMessage(
            response,
            scan ? "Low stock scan complete." : "Existing active alerts reloaded."
          )
        );
      }
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Failed to load low stock alerts."));
      setAlerts([]);
    } finally {
      setIsLoading(false);
    }
  }, [threshold]);

  useEffect(() => {
    void fetchAlerts(true, { showMessage: false });
    // Initial scan on first mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const acknowledgeAlert = useCallback(
    async (alertId) => {
      setAcknowledgingAlertId(alertId);
      setError("");

      try {
        const response = await lowStockApi.acknowledge(alertId);
        setMessage(getApiMessage(response, "Low stock alert acknowledged."));
        await fetchAlerts(false, { showMessage: false, preserveMessage: true });
      } catch (requestError) {
        setError(getErrorMessage(requestError, "Failed to acknowledge low stock alert."));
      } finally {
        setAcknowledgingAlertId("");
      }
    },
    [fetchAlerts]
  );

  const refreshActiveAlerts = useCallback(() => {
    return fetchAlerts(false, { showMessage: true });
  }, [fetchAlerts]);

  const scanNow = useCallback(() => {
    return fetchAlerts(true, { showMessage: true });
  }, [fetchAlerts]);

  const setThreshold = useCallback((value) => {
    const next = String(value ?? "").replace(/[^\d]/g, "");
    setThresholdInput(next);
  }, []);

  return {
    alerts,
    threshold: thresholdInput,
    setThreshold,
    isLoading,
    error,
    message,
    acknowledgingAlertId,
    acknowledgeAlert,
    refreshActiveAlerts,
    scanNow,
  };
}
