import { useEffect, useState } from "react";
import { FileText, BarChart3, Key, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [papers, setPapers] = useState(0);
  const [years, setYears] = useState(0);
  const [keywords, setKeywords] = useState(0);
  const [hasLastResearch, setHasLastResearch] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("lastResearch");

    if (stored) {
      const data = JSON.parse(stored);

      setPapers(data.results?.length || 0);
      setYears(Object.keys(data.trend_by_year || {}).length);
      setKeywords(Object.keys(data.top_keywords || {}).length);
      setHasLastResearch(true);
    }
  }, []);

  const handleJumpBack = () => {
    navigate("/workspace");
  };

  return (
    <div className="relative min-h-screen bg-[#020617] text-white overflow-hidden">

      {/* Glow Background */}
      <div className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-[-200px] left-[-200px] w-[600px] h-[600px] bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>

      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(71,85,105,0.25) 1px, transparent 1px),
            linear-gradient(90deg, rgba(71,85,105,0.25) 1px, transparent 1px)
          `,
          backgroundSize: "30px 30px",
        }}
      ></div>

      <div className="relative z-10 p-14">

        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
          Dashboard
        </h1>

        <p className="text-gray-400 mb-16 text-lg">
          Real-time AI research insights
        </p>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-10 mb-16">

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-3xl shadow-2xl">
            <FileText size={50} className="text-indigo-400 mb-6" />
            <h2 className="text-gray-400 text-lg">Papers Analyzed</h2>
            <p className="text-6xl font-bold mt-4 text-indigo-300">
              {papers}
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-3xl shadow-2xl">
            <BarChart3 size={50} className="text-cyan-400 mb-6" />
            <h2 className="text-gray-400 text-lg">Trend Years Found</h2>
            <p className="text-6xl font-bold mt-4 text-cyan-300">
              {years}
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-3xl shadow-2xl">
            <Key size={50} className="text-pink-400 mb-6" />
            <h2 className="text-gray-400 text-lg">Keywords Extracted</h2>
            <p className="text-6xl font-bold mt-4 text-pink-300">
              {keywords}
            </p>
          </div>

        </div>

        {/* Jump Back Section */}
        {hasLastResearch && (
          <div
            onClick={handleJumpBack}
            className="bg-gradient-to-r from-indigo-600/20 to-cyan-600/20 border border-indigo-500/30 p-8 rounded-3xl backdrop-blur-xl shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <RotateCcw size={32} className="text-indigo-400" />
              <div>
                <h2 className="text-2xl font-semibold text-indigo-300">
                  Jump Back to Your Last Research
                </h2>
                <p className="text-gray-400 mt-1">
                  Continue where you left off and view full analysis with graphs.
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default Dashboard;
