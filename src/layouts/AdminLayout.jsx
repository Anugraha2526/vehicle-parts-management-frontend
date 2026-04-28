import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function AdminLayout() {
  return (
    <div className="admin-shell">
      <Sidebar />
      <div className="admin-content">
        <Navbar />
        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
