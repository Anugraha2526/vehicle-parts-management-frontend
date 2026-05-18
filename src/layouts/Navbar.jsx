import { useLocation } from "react-router-dom";

function getPageMeta(pathname) {
  if (pathname.includes("/finance/purchase-invoices")) {
    return {
      title: "Purchase Invoices",
      subtitle: "Create stock update invoices from vendor purchases.",
    };
  }

  if (pathname.includes("/finance/reports")) {
    return {
      title: "Financial Reports",
      subtitle: "Track daily, monthly, and yearly performance.",
    };
  }

  if (pathname.includes("/finance/low-stock")) {
    return {
      title: "Low Stock Alerts",
      subtitle: "Monitor inventory levels before they run out.",
    };
  }

  return {
    title: "Admin Finance",
    subtitle: "Manage purchasing, reporting, and stock alerts.",
  };
}

export default function Navbar() {
  const location = useLocation();
  const meta = getPageMeta(location.pathname);

  return (
    <header className="topbar">
      <div>
        <h1 className="topbar-title">{meta.title}</h1>
        <p className="topbar-subtitle">{meta.subtitle}</p>
      </div>
    </header>
  );
}
