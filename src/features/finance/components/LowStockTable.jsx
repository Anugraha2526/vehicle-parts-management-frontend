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
      <section className="cs-card low-stock-table-card">
        <div className="card-heading low-stock-table-head">
          <h3 className="low-stock-table-title">Low Stock Alerts</h3>
        </div>
        <p className="cs-muted low-stock-empty-message">
          No active low stock alerts. Run a scan after changing threshold values.
        </p>
      </section>
    );
  }

  return (
    <section className="cs-card low-stock-table-card">
      <div className="card-heading low-stock-table-head">
        <h3 className="low-stock-table-title">Low Stock Alerts</h3>
      </div>
      <div className="cs-table-wrapper">
        <table className="cs-table cs-table--low-stock">
          <colgroup>
            <col className="low-stock-col-part" />
            <col className="low-stock-col-qty" />
            <col className="low-stock-col-threshold" />
            <col className="low-stock-col-notified" />
            <col className="low-stock-col-status" />
            <col className="low-stock-col-action" />
          </colgroup>
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
                    <strong className="low-stock-part-name">{alert.partName}</strong>
                    <p className="cs-muted cs-mono low-stock-part-id">{String(alert.partId)}</p>
                  </td>
                  <td className="low-stock-cell-number">{alert.currentStockQuantity}</td>
                  <td className="low-stock-cell-number">{alert.threshold}</td>
                  <td className="low-stock-cell-date">{formatDate(alert.notifiedAtUtc)}</td>
                  <td>
                    <span className={`status-badge status-badge--${status.variant}`}>
                      {status.text}
                    </span>
                  </td>
                  <td className="low-stock-action-cell">
                    <Button
                      type="button"
                      variant="ghost"
                      className="low-stock-action-btn"
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
