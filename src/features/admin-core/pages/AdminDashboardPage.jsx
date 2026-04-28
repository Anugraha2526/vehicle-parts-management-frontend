import "./AdminDashboard.css";

const PLACEHOLDER_CARDS = [
  "Total Parts in Catalog",
  "Low-stock Alerts",
  "Today's Sales Revenue",
  "Active Staff",
];

export default function AdminDashboardPage() {
  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard-header">
        <h1 className="admin-dashboard-title">Welcome back, Admin</h1>
        <p className="admin-dashboard-subtitle">ChitoSpare Admin Dashboard</p>
      </div>
      <div className="admin-dashboard-grid">
        {PLACEHOLDER_CARDS.map((label) => (
          <div key={label} className="admin-dashboard-card">
            <p className="admin-dashboard-card-label">{label}</p>
            <p className="admin-dashboard-card-coming">Coming soon</p>
          </div>
        ))}
      </div>
    </div>
  );
}
