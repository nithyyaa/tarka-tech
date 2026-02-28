import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Search,
  Clock,
  BarChart3,
  LogOut,
  Flame,
} from "lucide-react";
import { useEffect, useState } from "react";

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState([]);

  const linkStyle = (path) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
      location.pathname === path
        ? "bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-lg"
        : "text-gray-400 hover:bg-white/5 hover:text-white"
    }`;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("lastResearch");
    navigate("/login");
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://127.0.0.1:8000/research/opportunities",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      setOpportunities(data.opportunities || []);
    } catch (error) {
      console.error("Opportunity fetch error:", error);
    }
  };

  const handleOpportunityClick = (topic) => {
    localStorage.setItem("autoSearchTopic", topic);
    navigate("/workspace");
  };

  return (
    <div className="h-screen w-72 bg-gradient-to-b from-[#0f172a] to-[#020617] border-r border-slate-800 flex flex-col">

      {/* Scrollable Section */}
      <div className="p-8 overflow-y-auto custom-scrollbar">

        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent mb-12">
          ResearchPilot
        </h1>

        <nav className="space-y-4">
          <Link to="/dashboard" className={linkStyle("/dashboard")}>
            <LayoutDashboard size={20} />
            Dashboard
          </Link>

          <Link to="/workspace" className={linkStyle("/workspace")}>
            <Search size={20} />
            Workspace
          </Link>

          <Link to="/recent" className={linkStyle("/recent")}>
            <Clock size={20} />
            Recent Activity
          </Link>

          <Link to="/insights" className={linkStyle("/insights")}>
            <BarChart3 size={20} />
            Insights
          </Link>
        </nav>

        {/* Opportunity Radar */}
        <div className="mt-12">
          <div className="flex items-center gap-2 mb-4">
            <Flame size={16} className="text-orange-400" />
            <h2 className="text-xs uppercase tracking-wide text-gray-500">
              Opportunity Radar
            </h2>
          </div>

          {opportunities.length === 0 ? (
            <p className="text-xs text-gray-600">
              Build history to unlock insights.
            </p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar pr-1">
              {opportunities.map((item, index) => (
                <div
                  key={index}
                  onClick={() => handleOpportunityClick(item)}
                  className="text-xs text-gray-400 hover:text-white cursor-pointer transition-all duration-200"
                >
                  • {item}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Logout Section */}
      <div className="p-8 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  );
}

export default Sidebar;