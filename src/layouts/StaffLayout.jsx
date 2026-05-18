import { Outlet } from "react-router-dom";
import StaffSidebar from "./StaffSidebar";
import "./AdminLayout.css"; // Reuse the layout styling

export default function StaffLayout() {
  return (
    <div className="admin-layout">
      <StaffSidebar />
      <main className="admin-layout-main">
        <Outlet />
      </main>
    </div>
  );
}
