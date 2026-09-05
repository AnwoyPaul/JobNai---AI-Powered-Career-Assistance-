import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";

export default function MyMatches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/matches")
      .then(({ data }) => setMatches(data))
      .catch((err) => {
        setError(
          typeof err.response?.data === "string"
            ? err.response.data
            : "Failed to load matches."
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const scoreColor = (pct) => {
    if (pct >= 70) return "text-emerald-400 border-emerald-400/30 bg-emerald-400/10";
    if (pct >= 40) return "text-yellow-300 border-yellow-400/30 bg-yellow-400/10";
    return "text-slate-400 border-slate-600 bg-slate-800/40";
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <div className="px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <div className="mb-2 inline-block rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
            My Matches
          </div>
          <h1 className="text-3xl font-bold mb-2">Your Job Matches</h1>
          <p className="text-slate-400 mb-8">
            Scored against your confirmed resume profile, ranked highest first.
          </p>

          {loading && <p className="text-slate-500">Loading matches...</p>}

          {error && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-slate-400 mb-4">{error}</p>
              <Link
                to="/resume/upload"
                className="inline-block rounded-lg bg-emerald-500 px-5 py-2.5 font-semibold text-slate-950 hover:bg-emerald-400"
              >
                Upload Resume
              </Link>
            </div>
          )}

          {!loading && !error && matches.length === 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-400">
              No published job postings to match against yet.
            </div>
          )}

          <div className="space-y-4">
            {matches.map((m) => (
              <Link
                key={m.jobPostingId}
                to={`/jobs/${m.jobPostingId}`}
                className="block rounded-2xl border border-slate-800 bg-slate-900 p-6 hover:border-emerald-400/40 transition"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">{m.title}</h2>
                  <span className={`rounded-full border px-3 py-1 text-sm font-semibold ${scoreColor(m.matchPercentage)}`}>
                    {m.matchPercentage}% Match
                  </span>
                </div>

                {m.matchedSkills.length > 0 && (
                  <p className="mt-3 text-sm text-slate-400">
                    Matched: {m.matchedSkills.join(", ")}
                  </p>
                )}
                {m.missingSkills.length > 0 && (
                  <p className="mt-1 text-sm text-slate-500">
                    Missing: {m.missingSkills.slice(0, 5).join(", ")}
                    {m.missingSkills.length > 5 ? ` +${m.missingSkills.length - 5} more` : ""}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}