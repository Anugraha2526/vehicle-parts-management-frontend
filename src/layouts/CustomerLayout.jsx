import { Outlet } from "react-router-dom";
import CustomerSidebar from "./CustomerSidebar";
import AiChatWidget from "../components/common/AiChatWidget";
import "./AdminLayout.css";

export default function CustomerLayout() {
  return (
    <div className="admin-layout">
      <CustomerSidebar />
      <main className="admin-layout-main">
        <Outlet />
        <AiChatWidget />
      </main>
    </div>
  );
}
