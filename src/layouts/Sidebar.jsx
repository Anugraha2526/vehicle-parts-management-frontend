import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const financeLinks = [
  { label: "Purchase Invoices", path: "/admin/finance/purchase-invoices" },
  { label: "Financial Reports", path: "/admin/finance/reports" },
  { label: "Low Stock Alerts", path: "/admin/finance/low-stock" },
];

export default function Sidebar() {
  const { user } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">C</div>
        <div>
          <p className="sidebar-title">ChitoSpare</p>
          <p className="sidebar-subtitle">The bazaar for every vehicle needs.</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {financeLinks.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-link${isActive ? " is-active" : ""}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-profile">
        <p className="sidebar-profile-label">Signed in as</p>
        <p className="sidebar-profile-name">{user?.name || "Admin User"}</p>
        <p className="sidebar-profile-role">{user?.role || "Admin"}</p>
      </div>
    </aside>
  );
}
