import { useState, useEffect } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

function Workspace() {
  const [topic, setTopic] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.removeItem("lastResearch");
  }, []);

  const handleSearch = async () => {
    if (!topic) return;

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        "http://127.0.0.1:8000/research/search",
        null,
        {
          params: { topic },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("API DATA:", response.data);
      setData(response.data);

    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    }

    setLoading(false);
  };

  const parseSections = (text) => {
    if (!text) return { summary: "", gaps: [], questions: [] };

    const summaryPart = text.split("## Research Gaps")[0] || "";
    const gapsPart = text.split("## Research Gaps")[1]?.split("## Suggested Research Questions")[0] || "";
    const questionsPart = text.split("## Suggested Research Questions")[1] || "";

    return {
      summary: summaryPart.replace("## Trend Summary", "").trim(),
      gaps: gapsPart.split("\n").filter(line => line.trim().startsWith("-")),
      questions: questionsPart.split("\n").filter(line => line.trim().match(/^\d+/))
    };
  };

  const sections = parseSections(data?.ai_analysis);

  return (
    <div className="text-white min-h-screen px-14 pt-10">

      <h1 className="text-4xl font-bold mb-10 bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
        AI Research Workspace
      </h1>

      <div className="flex gap-4 mb-16">
        <input
          type="text"
          placeholder="Enter research topic..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="px-6 py-4 rounded-2xl bg-white/5 border border-white/10 w-96"
        />

        <button
          onClick={handleSearch}
          className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-cyan-600 rounded-2xl"
        >
          {loading ? "Analyzing..." : "Search"}
        </button>
      </div>

      {data && (
        <div className="space-y-14">

          <div className="bg-white/5 p-8 rounded-3xl">
            <h2 className="text-2xl mb-6 text-indigo-400">Trend Summary</h2>
            <p className="text-gray-300 whitespace-pre-wrap">
              {sections.summary}
            </p>
          </div>

          <div className="bg-white/5 p-8 rounded-3xl">
            <h2 className="text-2xl mb-6 text-cyan-400">
              Research Trend Over Time
            </h2>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={Object.entries(data.trend_by_year || {}).map(
                    ([year, count]) => ({ year, count })
                  )}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="year" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#06b6d4" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Research Papers */}
          <div className="bg-white/5 p-8 rounded-3xl">
            <h2 className="text-2xl mb-6 text-indigo-400">Research Papers</h2>

            {data.results?.length > 0 && (
              <div className="space-y-6">
                {data.results.map((paper, index) => (
                  <div key={index} className="bg-white/5 p-6 rounded-2xl">
                    <h3 className="text-cyan-300 font-semibold">
                      {paper.title}
                    </h3>

                    <p className="text-sm text-gray-400">
                      {paper.authors?.length
                        ? paper.authors.join(", ")
                        : "No authors available"}
                    </p>

                    <p className="text-sm text-gray-400 mt-2">
                      {paper.summary}
                    </p>

                    {paper.pdf_link && (
                      <a
                        href={paper.pdf_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-4 px-4 py-2 bg-indigo-600 rounded-xl"
                      >
                        Download PDF
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}

export default Workspace;
