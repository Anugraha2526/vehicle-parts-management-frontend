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
    <div className="finance-page finance-page--low-stock">
      <PageHeader
        title="Low Stock Alerts"
        subtitle="Monitor inventory levels and notify admin before stock runs out."
      />

      {error ? <Alert variant="error">{error}</Alert> : null}
      {message ? (
        <div className="ui-toast-layer" role="status" aria-live="polite">
          <Alert variant="success">{message}</Alert>
        </div>
      ) : null}

      <section className="cs-card low-stock-toolbar">
        <div className="low-stock-toolbar-head">
          <h3 className="low-stock-toolbar-title">Alert Settings</h3>
          <p className="low-stock-toolbar-subtitle">
            Choose a threshold and run a scan to update active alerts.
          </p>
          <p className="cs-helper">
            Threshold changes apply when you click <strong>Scan &amp; Notify</strong>.
          </p>
        </div>

        <div className="low-stock-toolbar-controls">
          <label className="cs-field low-stock-threshold-field">
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
              Reload Existing Alerts
            </Button>
            <Button type="button" variant="primary" onClick={scanNow} disabled={isLoading}>
              {isLoading ? "Scanning..." : "Scan & Notify"}
            </Button>
          </div>
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
