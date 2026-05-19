import { formatDate } from "../../../utils/formatDate";

function sortedAlerts(alerts) {
  return [...alerts].sort((left, right) => {
    if (left.isAcknowledged !== right.isAcknowledged) {
      return left.isAcknowledged ? 1 : -1;
    }

    if (left.currentStockQuantity !== right.currentStockQuantity) {
      return left.currentStockQuantity - right.currentStockQuantity;
    }

    return left.partName.localeCompare(right.partName);
  });
}

export default function AdminDashboardLowStockPanel({
  alerts,
  threshold,
  onThresholdChange,
  onScan,
  onAcknowledge,
  acknowledgingAlertId,
  isScanning,
}) {
  const topAlerts = sortedAlerts(alerts).slice(0, 6);

  return (
    <section className="admin-panel">
      <div className="admin-panel-header">
        <div>
          <h3>Low Stock Monitor</h3>
          <p>Scan current inventory and acknowledge critical alerts.</p>
        </div>
      </div>

      <div className="admin-threshold-row">
        <label className="admin-threshold-field">
          Threshold
          <input
            type="number"
            min="1"
            value={threshold}
            onChange={(event) => onThresholdChange(event.target.value)}
          />
        </label>
        <button
          type="button"
          className="admin-inline-button"
          onClick={onScan}
          disabled={isScanning}
        >
          {isScanning ? "Scanning..." : "Scan Inventory"}
        </button>
      </div>
      <p className="admin-panel-caption">
        Threshold changes apply when you run a fresh scan.
      </p>

      {topAlerts.length === 0 ? (
        <div className="admin-empty">
          <p>No active alerts at the selected threshold.</p>
        </div>
      ) : (
        <ul className="admin-alert-list">
          {topAlerts.map((alert) => (
            <li key={alert.alertId} className="admin-alert-row">
              <div>
                <p className="admin-alert-part">{alert.partName}</p>
                <p className="admin-alert-meta">
                  Stock {alert.currentStockQuantity} / Threshold {alert.threshold}
                  {alert.notifiedAtUtc ? ` | ${formatDate(alert.notifiedAtUtc)}` : ""}
                </p>
              </div>

              {alert.isAcknowledged ? (
                <span className="admin-status-badge is-muted">Acknowledged</span>
              ) : (
                <button
                  type="button"
                  className="admin-inline-button secondary"
                  disabled={acknowledgingAlertId === alert.alertId}
                  onClick={() => onAcknowledge(alert.alertId)}
                >
                  {acknowledgingAlertId === alert.alertId ? "Saving..." : "Acknowledge"}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

