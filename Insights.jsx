import { useEffect, useState } from "react";
import { BarChart3 } from "lucide-react";

function Insights() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    const token = localStorage.getItem("token");

    const response = await fetch("http://127.0.0.1:8000/research/insights", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();
    setData(result);
  };

  if (!data) {
    return (
      <div className="min-h-screen bg-[#020617] text-white p-14">
        <p className="text-gray-400">Loading insights...</p>
      </div>
    );
  }

  if (data.message) {
    return (
      <div className="min-h-screen bg-[#020617] text-white p-14">
        <p className="text-gray-400">{data.message}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white p-14">
      <div className="flex items-center gap-3 mb-10">
        <BarChart3 size={32} className="text-indigo-400" />
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
          Research Intelligence Insights
        </h1>
      </div>

      <div className="grid grid-cols-3 gap-8">

        <div className="bg-white/5 p-8 rounded-2xl border border-white/10">
          <h2 className="text-gray-400">Total Searches</h2>
          <p className="text-4xl font-bold text-indigo-300 mt-2">
            {data.total_searches}
          </p>
        </div>

        <div className="bg-white/5 p-8 rounded-2xl border border-white/10">
          <h2 className="text-gray-400">Most Explored Topic</h2>
          <p className="text-xl font-semibold text-cyan-300 mt-2">
            {data.most_common_topic}
          </p>
        </div>

        <div className="bg-white/5 p-8 rounded-2xl border border-white/10">
          <h2 className="text-gray-400">Behavior Type</h2>
          <p className="text-xl font-semibold text-pink-300 mt-2">
            {data.behavior_type}
          </p>
        </div>

        <div className="bg-white/5 p-8 rounded-2xl border border-white/10">
          <h2 className="text-gray-400">Research Span (Days)</h2>
          <p className="text-3xl font-bold text-green-300 mt-2">
            {data.research_span_days}
          </p>
        </div>

        <div className="bg-white/5 p-8 rounded-2xl border border-white/10">
          <h2 className="text-gray-400">Average Gap (Days)</h2>
          <p className="text-3xl font-bold text-yellow-300 mt-2">
            {data.average_gap_days}
          </p>
        </div>

        <div className="bg-white/5 p-8 rounded-2xl border border-white/10">
          <h2 className="text-gray-400">Activity Intensity</h2>
          <p className="text-3xl font-bold text-purple-300 mt-2">
            {data.activity_intensity}
          </p>
        </div>

      </div>
    </div>
  );
}

export default Insights;