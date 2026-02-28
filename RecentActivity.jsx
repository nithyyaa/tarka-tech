import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

function RecentActivity() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://127.0.0.1:8000/research/history", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      setHistory(data);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-14">
      <div className="flex items-center gap-3 mb-10">
        <Clock className="text-indigo-400" size={32} />
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
          Recent Activities
        </h1>
      </div>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : history.length === 0 ? (
        <p className="text-gray-400">
          No research activity yet. Start exploring 🚀
        </p>
      ) : (
        <div className="space-y-6">
          {history.map((item) => (
            <div
              key={item.id}
              className="bg-white/5 border border-white/10 backdrop-blur-xl p-6 rounded-2xl hover:bg-white/10 transition-all"
            >
              <h2 className="text-xl font-semibold mb-2 text-indigo-300">
                {item.topic}
              </h2>
              <p className="text-gray-400 text-sm mb-4">
                {new Date(item.created_at).toLocaleString()}
              </p>
              <p className="text-gray-300 line-clamp-3">
                {item.ai_summary}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RecentActivity;