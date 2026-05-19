export default function AdminDashboardQuickActions({ onNavigate }) {
  const actions = [
    {
      id: "purchase",
      title: "Create Purchase Invoice",
      subtitle: "Record incoming stock from vendors.",
      to: "/admin/finance/purchase-invoices",
    },
    {
      id: "reports",
      title: "Open Financial Reports",
      subtitle: "Compare daily, monthly, and yearly outcomes.",
      to: "/admin/finance/reports",
    },
    {
      id: "low-stock",
      title: "Review Low Stock Alerts",
      subtitle: "Scan and acknowledge critical inventory warnings.",
      to: "/admin/finance/low-stock",
    },
  ];

  return (
    <section className="admin-panel">
      <div className="admin-panel-header">
        <div>
          <h3>Quick Actions</h3>
          <p>Jump straight into the workflows you use most often.</p>
        </div>
      </div>

      <div className="admin-actions-grid">
        {actions.map((action) => (
          <button
            key={action.id}
            type="button"
            className="admin-action-tile"
            onClick={() => onNavigate(action.to)}
          >
            <span className="admin-action-title">{action.title}</span>
            <span className="admin-action-subtitle">{action.subtitle}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

