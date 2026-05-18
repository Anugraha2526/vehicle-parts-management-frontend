import { Outlet } from "react-router-dom";
import AiChatWidget from "../components/common/AiChatWidget";

export default function CustomerLayout() {
  return (
    <main>
      <Outlet />
      <AiChatWidget />
    </main>
  );
}
