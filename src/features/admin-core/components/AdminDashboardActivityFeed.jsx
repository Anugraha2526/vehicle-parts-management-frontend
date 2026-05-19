import { formatDate } from "../../../utils/formatDate";

function metricLine(label, value) {
  return `${label}: ${value}`;
}

export default function AdminDashboardActivityFeed({
  selectedPeriod,
  activeReport,
  openAlerts,
  inventoryCounts,
  lastUpdatedAt,
}) {
  const events = [
    {
      id: "period",
      title: "Current reporting period selected",
      detail: selectedPeriod[0].toUpperCase() + selectedPeriod.slice(1),
      timestamp: lastUpdatedAt,
    },
    {
      id: "report",
      title: "Financial totals loaded",
      detail: [
        metricLine("Purchases", activeReport.purchaseInvoiceCount ?? 0),
        metricLine("Sales", activeReport.salesInvoiceCount ?? 0),
      ].join(" | "),
      timestamp: lastUpdatedAt,
    },
    {
      id: "alerts",
      title: "Open low stock alerts",
      detail: `${openAlerts.length} part(s) below threshold`,
      timestamp: lastUpdatedAt,
    },
    {
      id: "inventory",
      title: "Catalog snapshot",
      detail: `${inventoryCounts.parts ?? 0} parts | ${inventoryCounts.vendors ?? 0} vendors | ${
        inventoryCounts.staff ?? 0
      } staff`,
      timestamp: lastUpdatedAt,
    },
  ];

  return (
    <section className="admin-panel">
      <div className="admin-panel-header">
        <div>
          <h3>System Pulse</h3>
          <p>Live checkpoints from the current dashboard refresh.</p>
        </div>
      </div>

      <ul className="admin-activity-list">
        {events.map((event) => (
          <li key={event.id} className="admin-activity-row">
            <span className="admin-activity-dot" aria-hidden="true" />
            <div>
              <p className="admin-activity-title">{event.title}</p>
              <p className="admin-activity-detail">{event.detail}</p>
              <p className="admin-activity-time">
                {event.timestamp ? formatDate(event.timestamp) : "Waiting for first refresh"}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

