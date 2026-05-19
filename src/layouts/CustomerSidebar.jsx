import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "./Sidebar.css";

const NAV_ITEMS = [
  { to: "/portal", label: "Home", icon: "HM", end: true },
  { to: "/portal/profile", label: "My Profile", icon: "PR" },
  { to: "/portal/appointments", label: "My Appointments", icon: "AP" },
  { to: "/portal/service-history", label: "Service History", icon: "SH" },
  { to: "/portal/reviews", label: "Service Reviews", icon: "RV" },
  { to: "/portal/part-requests", label: "Request a Part", icon: "RP" },
];

export default function CustomerSidebar() {
  const { user, logout } = useAuth();

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "C";

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">ChitoSpare</div>

      <nav className="sidebar-nav" aria-label="Customer navigation">
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
            <span className="sidebar-user-name">{user?.fullName ?? "Customer"}</span>
            <span className="sidebar-user-role">Customer</span>
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
