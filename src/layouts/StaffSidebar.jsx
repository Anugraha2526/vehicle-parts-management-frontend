import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "./Sidebar.css"; // Reuse existing Sidebar styling

const NAV_ITEMS = [
  { to: "/staff", label: "Dashboard", icon: "DB", end: true },
  { to: "/staff/sales", label: "Sales & Invoices", icon: "SD" },
  { to: "/customers", label: "Customers & Search", icon: "👥" },
  { to: "/register-customer", label: "Register Customer", icon: "➕" },
  { to: "/staff/reminders", label: "Pending Credits", icon: "CR" },
  { to: "/staff/finance/reports", label: "Reports", icon: "FR" },
];

export default function StaffSidebar() {
  const { user, logout } = useAuth();

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : (user?.role?.[0] ?? "S").toUpperCase();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">ChitoSpare</div>

      <nav className="sidebar-nav" aria-label="Staff navigation">
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
            <span className="sidebar-user-name">{user?.fullName ?? user?.role ?? "Staff"}</span>
            <span className="sidebar-user-role">{user?.role ?? "Staff"}</span>
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
