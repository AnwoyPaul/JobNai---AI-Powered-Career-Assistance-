import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";

const statusLabel = { 0: "Submitted", 1: "Reviewed", 2: "Accepted", 3: "Rejected" };
const statusColor = {
  0: "bg-slate-700/40 text-slate-300 border-slate-600",
  1: "bg-yellow-400/10 text-yellow-300 border-yellow-400/30",
  2: "bg-emerald-400/10 text-emerald-300 border-emerald-400/30",
  3: "bg-red-400/10 text-red-300 border-red-400/30",
};

export default function JobApplicants() {
  const { id } = useParams();
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    api.get(`/applications/job/${id}`)
      .then(({ data }) => setApplicants(data))
      .catch(() => setError("Could not load applicants for this posting."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const updateStatus = async (applicationId, status) => {
    await api.post(`/applications/${applicationId}/status`, { status });
    load();
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <div className="px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <Link to="/employer/dashboard" className="text-emerald-400 text-sm hover:underline">&larr; Back to my postings</Link>

          <h1 className="text-3xl font-bold mt-4 mb-6">Applicants</h1>

          {loading && <p className="text-slate-500">Loading...</p>}
          {error && <p className="text-red-400">{error}</p>}

          {!loading && !error && applicants.length === 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-400">
              No applicants yet.
            </div>
          )}

          <div className="space-y-4">
            {applicants.map((a) => (
              <div key={a.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-semibold">{a.applicantName}</p>
                    <p className="text-sm text-slate-500">{a.applicantEmail}</p>
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-xs ${statusColor[a.status]}`}>
                    {statusLabel[a.status]}
                  </span>
                </div>

                {a.coverLetterContent && (
                  <details className="mt-3">
                    <summary className="text-sm text-emerald-400 cursor-pointer">View cover letter</summary>
                    <p className="mt-2 text-sm text-slate-400 whitespace-pre-wrap">{a.coverLetterContent}</p>
                  </details>
                )}

                <div className="mt-4 flex gap-2">
                  <button onClick={() => updateStatus(a.id, "Reviewed")} className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800">Mark Reviewed</button>
                  <button onClick={() => updateStatus(a.id, "Accepted")} className="rounded-lg border border-emerald-400/40 px-3 py-1.5 text-xs text-emerald-300 hover:bg-emerald-400/10">Accept</button>
                  <button onClick={() => updateStatus(a.id, "Rejected")} className="rounded-lg border border-red-500/40 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/10">Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}