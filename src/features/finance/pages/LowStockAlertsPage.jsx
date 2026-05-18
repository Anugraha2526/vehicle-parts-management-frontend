import Button from "../../../components/common/Button";
import Alert from "../../../components/ui/Alert";
import PageHeader from "../../../components/ui/PageHeader";
import LowStockTable from "../components/LowStockTable";
import { useLowStock } from "../hooks/useLowStock";

export default function LowStockAlertsPage() {
  const {
    alerts,
    threshold,
    setThreshold,
    isLoading,
    error,
    message,
    acknowledgingAlertId,
    acknowledgeAlert,
    refreshActiveAlerts,
    scanNow,
  } = useLowStock();

  return (
    <div className="finance-page">
      <PageHeader
        title="Low Stock Alerts"
        subtitle="Scan inventory and notify before part quantities drop below your threshold."
      />

      {error ? <Alert variant="error">{error}</Alert> : null}
      {message ? <Alert variant="info">{message}</Alert> : null}

      <section className="cs-card low-stock-toolbar">
        <label className="cs-field">
          Threshold
          <input
            className="cs-input"
            type="number"
            min="1"
            value={threshold}
            onChange={(event) => setThreshold(event.target.value)}
          />
        </label>

        <div className="low-stock-actions">
          <Button type="button" variant="secondary" onClick={refreshActiveAlerts} disabled={isLoading}>
            View Active Alerts
          </Button>
          <Button type="button" variant="primary" onClick={scanNow} disabled={isLoading}>
            {isLoading ? "Scanning..." : "Scan & Notify"}
          </Button>
        </div>
      </section>

      <LowStockTable
        alerts={alerts}
        onAcknowledge={acknowledgeAlert}
        acknowledgingAlertId={acknowledgingAlertId}
        isLoading={isLoading}
      />
    </div>
  );
}
