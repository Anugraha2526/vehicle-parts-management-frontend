import Button from "../../../components/common/Button";
import { formatDate } from "../../../utils/formatDate";

function getAlertStatus(alert) {
  if (alert.isAcknowledged) {
    return { text: "Acknowledged", variant: "info" };
  }

  if (alert.currentStockQuantity <= 0) {
    return { text: "Out of stock", variant: "error" };
  }

  if (alert.currentStockQuantity <= alert.threshold) {
    return { text: `Low - ${alert.currentStockQuantity}`, variant: "warning" };
  }

  return { text: "Healthy", variant: "success" };
}

export default function LowStockTable({
  alerts,
  onAcknowledge,
  acknowledgingAlertId,
  isLoading,
}) {
  if (!isLoading && alerts.length === 0) {
    return (
      <section className="cs-card">
        <h3>Low Stock Alerts</h3>
        <p className="cs-muted">No active low stock alerts at the selected threshold.</p>
      </section>
    );
  }

  return (
    <section className="cs-card">
      <h3>Low Stock Alerts</h3>
      <div className="cs-table-wrapper">
        <table className="cs-table">
          <thead>
            <tr>
              <th>Part</th>
              <th>Current Qty</th>
              <th>Threshold</th>
              <th>Notified</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((alert) => {
              const status = getAlertStatus(alert);
              const isRowAcknowledging = acknowledgingAlertId === alert.alertId;

              return (
                <tr key={alert.alertId}>
                  <td>
                    <strong>{alert.partName}</strong>
                    <p className="cs-muted cs-mono">{String(alert.partId)}</p>
                  </td>
                  <td>{alert.currentStockQuantity}</td>
                  <td>{alert.threshold}</td>
                  <td>{formatDate(alert.notifiedAtUtc)}</td>
                  <td>
                    <span className={`status-badge status-badge--${status.variant}`}>
                      {status.text}
                    </span>
                  </td>
                  <td>
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={alert.isAcknowledged || isRowAcknowledging}
                      onClick={() => onAcknowledge(alert.alertId)}
                    >
                      {isRowAcknowledging ? "Saving..." : "Acknowledge"}
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
