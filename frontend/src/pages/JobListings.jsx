import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";

export default function JobListings() {
  const [postings, setPostings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/jobpostings")
      .then(({ data }) => setPostings(data))
      .catch(() => setError("Failed to load job postings."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = postings.filter((p) => {
    const skills = JSON.parse(p.requiredSkills || "[]").join(" ").toLowerCase();
    const q = search.toLowerCase();
    return p.title.toLowerCase().includes(q) || skills.includes(q);
  });

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <div className="px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="mb-2 inline-block rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
            Job Board
          </div>
          <h1 className="text-3xl font-bold mb-6">Browse Jobs</h1>

          <input
            className="w-full mb-8 rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-emerald-400"
            placeholder="Search by title or skill (e.g. Python, React, Backend)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {loading && <p className="text-slate-500">Loading postings...</p>}
          {error && <p className="text-red-400">{error}</p>}

          {!loading && filtered.length === 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-400">
              {postings.length === 0 ? "No job postings available yet." : "No postings match your search."}
            </div>
          )}

          <div className="space-y-4">
            {filtered.map((p) => {
              const skills = JSON.parse(p.requiredSkills || "[]");
              return (
                <Link
                  key={p.id}
                  to={`/jobs/${p.id}`}
                  className="block rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:border-emerald-400/40"
                >
                  <h2 className="text-xl font-semibold">{p.title}</h2>
                  <p className="text-slate-400 mt-1 text-sm line-clamp-2 whitespace-pre-wrap">
                    {p.description}
                  </p>
                  {skills.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {skills.slice(0, 6).map((s, i) => (
                        <span key={i} className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs text-slate-300">
                          {s}
                        </span>
                      ))}
                      {skills.length > 6 && (
                        <span className="text-xs text-slate-500 px-2 py-1">+{skills.length - 6} more</span>
                      )}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}