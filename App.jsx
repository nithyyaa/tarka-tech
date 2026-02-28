import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Workspace from "./pages/Workspace";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RecentActivity from "./pages/RecentActivity";
import Insights from "./pages/Insights";
import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>

        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <div className="flex min-h-screen bg-[#020617]">
                <Sidebar />
                <div className="flex-1 overflow-y-auto">
                  <Dashboard />
                </div>
              </div>
            </ProtectedRoute>
          }
        />

        {/* Workspace */}
        <Route
          path="/workspace"
          element={
            <ProtectedRoute>
              <div className="flex min-h-screen bg-[#020617]">
                <Sidebar />
                <div className="flex-1 overflow-y-auto">
                  <Workspace />
                </div>
              </div>
            </ProtectedRoute>
          }
        />

        {/* Recent Activity */}
        <Route
          path="/recent"
          element={
            <ProtectedRoute>
              <div className="flex min-h-screen bg-[#020617]">
                <Sidebar />
                <div className="flex-1 overflow-y-auto">
                  <RecentActivity />
                </div>
              </div>
            </ProtectedRoute>
          }
        />

        {/* Insights */}
        <Route
          path="/insights"
          element={
            <ProtectedRoute>
              <div className="flex min-h-screen bg-[#020617]">
                <Sidebar />
                <div className="flex-1 overflow-y-auto">
                  <Insights />
                </div>
              </div>
            </ProtectedRoute>
          }
        />

      </Routes>
    </Router>
  );
}

export default App;