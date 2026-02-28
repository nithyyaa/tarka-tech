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
    const stored = localStorage.getItem("lastResearch");
    if (stored) {
      const parsed = JSON.parse(stored);
      setData(parsed);
      setTopic(parsed.topic || "");
    }
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

      setData(response.data);
      localStorage.setItem("lastResearch", JSON.stringify(response.data));
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

    const gaps = gapsPart
      .split("\n")
      .filter(line => line.trim().match(/^[-•]/));

    const questions = questionsPart
      .split("\n")
      .filter(line => line.trim().match(/^\d+\.|^[-•]/));

    return {
      summary: summaryPart.replace("## Trend Summary", "").trim(),
      gaps,
      questions
    };
  };

  const sections = parseSections(data?.ai_analysis);

  return (
    <div className="relative text-white min-h-screen px-14 pt-10">

      <h1 className="text-4xl font-bold mb-10 bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
        AI Research Workspace
      </h1>

      <div className="flex gap-4 mb-16">
        <input
          type="text"
          placeholder="Enter research topic..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="px-6 py-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 w-96 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
        />

        <button
          onClick={handleSearch}
          className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-cyan-600 rounded-2xl shadow-xl hover:scale-105 transition-all duration-300"
        >
          {loading ? "Analyzing..." : "Search"}
        </button>
      </div>

      {data && (
        <div className="space-y-14">

          {/* Trend Summary */}
          <div className="bg-white/5 border border-white/10 p-8 rounded-3xl shadow-2xl">
            <h2 className="text-2xl font-semibold mb-6 text-indigo-400">
              Trend Summary
            </h2>
            <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
              {sections.summary}
            </p>
          </div>

          {/* Research Gaps */}
          {sections.gaps.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/30 p-8 rounded-3xl">
              <h2 className="text-2xl font-semibold mb-6 text-red-400">
                Identified Research Gaps
              </h2>
              <ul className="space-y-3">
                {sections.gaps.map((gap, index) => (
                  <li key={index} className="text-red-200">
                    {gap.replace(/^[-•]\s*/, "")}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Research Questions */}
          {sections.questions.length > 0 && (
            <div className="bg-green-500/10 border border-green-500/30 p-8 rounded-3xl">
              <h2 className="text-2xl font-semibold mb-6 text-green-400">
                Suggested Research Questions
              </h2>
              <ul className="space-y-3">
                {sections.questions.map((q, index) => (
                  <li key={index} className="text-green-200">
                    {q.replace(/^\d+\.|^[-•]\s*/, "")}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Graph */}
          <div className="bg-white/5 border border-white/10 p-8 rounded-3xl shadow-2xl">
            <h2 className="text-2xl font-semibold mb-8 text-cyan-400">
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
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#06b6d4"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Authors */}
          <div className="bg-white/5 border border-white/10 p-8 rounded-3xl shadow-2xl">
            <h2 className="text-2xl font-semibold mb-6 text-pink-400">
              Top Authors
            </h2>
            <div className="space-y-4">
              {Object.entries(data.top_authors || {}).map(([author, count]) => (
                <div
                  key={author}
                  className="flex justify-between bg-white/5 px-6 py-3 rounded-xl"
                >
                  <span>{author}</span>
                  <span className="text-pink-300 font-semibold">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Keywords */}
          <div className="bg-white/5 border border-white/10 p-8 rounded-3xl shadow-2xl">
            <h2 className="text-2xl font-semibold mb-6 text-green-400">
              Top Keywords
            </h2>
            <div className="flex flex-wrap gap-4">
              {Object.entries(data.top_keywords || {}).map(([word, count]) => (
                <div
                  key={word}
                  className="bg-green-600/20 px-4 py-2 rounded-full text-sm"
                >
                  {word} ({count})
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

export default Workspace;