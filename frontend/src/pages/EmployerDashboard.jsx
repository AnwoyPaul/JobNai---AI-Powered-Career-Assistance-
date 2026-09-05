import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";

const statusLabel = { 0: "Draft", 1: "Published", 2: "Closed" };
const statusColor = {
  0: "bg-slate-700/40 text-slate-300 border-slate-600",
  1: "bg-emerald-400/10 text-emerald-300 border-emerald-400/30",
  2: "bg-red-400/10 text-red-300 border-red-400/30",
};

export default function EmployerDashboard() {
  const [postings, setPostings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const load = () => {
    setLoading(true);
    api.get("/jobpostings/mine")
      .then(({ data }) => setPostings(data))
      .catch(() => setError("Failed to load postings."))
      .finally(() => setLoading(false));
  };
  
  
  useEffect(() => { load(); }, []);

  const publish = async (id) => {
    await api.post(`/jobpostings/${id}/publish`);
    load();
  };

  const close = async (id) => {
    await api.post(`/jobpostings/${id}/close`);
    load();
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <div className="px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="mb-2 inline-block rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                Employer Dashboard
              </div>
              <h1 className="text-3xl font-bold">My Job Postings</h1>
            </div>
            <Link
              to="/employer/postings/new"
              className="rounded-lg bg-emerald-500 px-5 py-2.5 font-semibold text-slate-950 transition hover:bg-emerald-400"
            >
              + New Posting
            </Link>
          </div>

          {loading && <p className="text-slate-500">Loading...</p>}
          {error && <p className="text-red-400">{error}</p>}

          {!loading && postings.length === 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-400">
              You haven't created any postings yet.
            </div>
          )}

          <div className="space-y-4">
            {postings.map((p) => {
              const skills = JSON.parse(p.requiredSkills || "[]");
              return (
                <div key={p.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-semibold">{p.title}</h2>
                      <p className="text-slate-400 mt-1 text-sm whitespace-pre-wrap">{p.description}</p>
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-xs ${statusColor[p.status]}`}>
                      {statusLabel[p.status]}
                    </span>
                  </div>

                  {skills.length > 0 && (
                    <p className="mt-3 text-sm text-slate-500">Skills: {skills.join(", ")}</p>
                  )}

                  <div className="mt-4 flex gap-3">
                    <Link
                      to={`/employer/postings/${p.id}/applicants`}
                      className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
                    >
                      Applicants
                    </Link>
                    <Link
                      to={`/employer/postings/${p.id}/edit`}
                      className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
                    >
                      Edit
                    </Link>
                    {p.status === 0 && (
                      <button
                        onClick={() => publish(p.id)}
                        className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
                      >
                        Publish
                      </button>
                    )}
                    {p.status === 1 && (
                      <button
                        onClick={() => close(p.id)}
                        className="rounded-lg border border-red-500/40 px-4 py-2 text-sm text-red-300 hover:bg-red-500/10"
                      >
                        Close
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}