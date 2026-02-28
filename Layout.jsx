import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";

function Layout() {
  return (
    <div className="flex min-h-screen bg-[#020617] text-white">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-10 relative">
        <Outlet />
      </div>

    </div>
  );
}

export default Layout;