import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "./Sidebar.css";

const NAV_ITEMS = [
  { to: "/admin", label: "Dashboard", icon: "DB", end: true },
  { to: "/admin/staff", label: "Staff", icon: "ST" },
  { to: "/admin/vendors", label: "Vendors", icon: "VN" },
  { to: "/admin/parts", label: "Parts & Inventory", icon: "PT" },
  { to: "/admin/finance/purchase-invoices", label: "Purchase Invoices", icon: "PI" },
  { to: "/admin/finance/reports", label: "Financial Reports", icon: "FR" },
  { to: "/admin/finance/low-stock", label: "Low Stock Alerts", icon: "LS" },
  { to: "/admin/reminders", label: "Credit Reminders", icon: "CR" },
  { to: "/customers",     label: "Customers",        icon: "👤" },
  { to: "/register-customer", label: "Registration", icon: "➕" },
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : (user?.role?.[0] ?? "A").toUpperCase();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">ChitoSpare</div>

      <nav className="sidebar-nav" aria-label="Admin navigation">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `sidebar-nav-item${isActive ? " sidebar-nav-item--active" : ""}`
            }
          >
            <span className="sidebar-nav-icon" aria-hidden="true">
              {item.icon}
            </span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar" aria-hidden="true">
            {initials}
          </div>
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{user?.fullName ?? user?.role ?? "Admin"}</span>
            <span className="sidebar-user-role">{user?.role ?? "Admin"}</span>
          </div>
          <button
            className="sidebar-logout"
            onClick={logout}
            aria-label="Sign out"
            title="Sign out"
          >
            OUT
          </button>
        </div>
      </div>
    </aside>
  );
}
