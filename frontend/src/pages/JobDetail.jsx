import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [posting, setPosting] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [match, setMatch] = useState(null);
  const [matchLoading, setMatchLoading] = useState(false);
  const [matchError, setMatchError] = useState("");

  const [applied, setApplied] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState("");

  useEffect(() => {
    api.get(`/jobpostings/${id}`)
      .then(({ data }) => setPosting(data))
      .catch(() => setError("This posting could not be found or is no longer available."))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (user?.role === "JobSeeker") {
      setMatchLoading(true);
      api.get(`/jobpostings/${id}/match`)
        .then(({ data }) => setMatch(data))
        .catch((err) => {
          setMatchError(
            typeof err.response?.data === "string"
              ? err.response.data
              : "Could not compute match."
          );
        })
        .finally(() => setMatchLoading(false));
    }
  }, [id, user]);

  useEffect(() => {
    if (user?.role === "JobSeeker") {
      api.get(`/applications/check/${id}`)
        .then(({ data }) => setApplied(data.applied))
        .catch(() => {});
    }
  }, [id, user]);

  const handleApply = async () => {
    setApplying(true);
    setApplyError("");
    try {
      await api.post("/applications", { jobPostingId: posting.id });
      setApplied(true);
    } catch (err) {
      setApplyError(err.response?.data || "Failed to apply.");
    } finally {
      setApplying(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <div className="px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <Link to="/jobs" className="text-emerald-400 text-sm hover:underline">&larr; Back to all jobs</Link>

          {loading && <p className="text-slate-500 mt-6">Loading...</p>}
          {error && <p className="text-red-400 mt-6">{error}</p>}

          {posting && (
            <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-8">
              <h1 className="text-3xl font-bold mb-4">{posting.title}</h1>

              <div className="mb-6 flex flex-wrap gap-2">
                {JSON.parse(posting.requiredSkills || "[]").map((s, i) => (
                  <span key={i} className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                    {s}
                  </span>
                ))}
              </div>

              <div className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                {posting.description}
              </div>

              {user?.role === "JobSeeker" && (
                <div className="mt-8 rounded-xl border border-slate-800 bg-slate-950 p-5">
                  <h3 className="text-sm font-semibold text-emerald-400 mb-3">Your Match</h3>

                  {matchLoading && <p className="text-slate-500 text-sm">Calculating your match score...</p>}

                  {matchError && (
                    <div>
                      <p className="text-slate-400 text-sm mb-3">{matchError}</p>
                      <Link
                        to="/resume/upload"
                        className="inline-block rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
                      >
                        Upload Resume
                      </Link>
                    </div>
                  )}

                  {match && (
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl font-bold text-emerald-400">{match.matchPercentage}%</span>
                        <span className="text-slate-500 text-sm">match with your profile</span>
                      </div>

                      {match.matchedSkills.length > 0 && (
                        <p className="text-sm text-slate-300 mb-1">
                          <span className="text-emerald-400">Matched:</span> {match.matchedSkills.join(", ")}
                        </p>
                      )}
                      {match.missingSkills.length > 0 && (
                        <p className="text-sm text-slate-400 mb-3">
                          <span className="text-red-300">Missing:</span> {match.missingSkills.join(", ")}
                        </p>
                      )}

                      {match.learningSuggestions && (
                        <div className="mt-3 rounded-lg bg-slate-900 border border-slate-800 p-3 text-sm text-slate-400">
                          {match.learningSuggestions}
                        </div>
                      )}

                      <div className="mt-4 flex items-center gap-3 flex-wrap">
                        <Link
                          to="/cover-letter"
                          state={{ jobPostingId: posting.id, jobTitle: posting.title }}
                          className="inline-block rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
                        >
                          Generate Cover Letter
                        </Link>

                        {applied ? (
                          <span className="rounded-lg bg-emerald-500/10 border border-emerald-400/30 px-5 py-2.5 text-sm font-semibold text-emerald-300">
                            ✓ Applied
                          </span>
                        ) : (
                          <button
                            onClick={handleApply}
                            disabled={applying}
                            className="rounded-lg border border-emerald-400/40 px-5 py-2.5 text-sm font-semibold text-emerald-300 hover:bg-emerald-400/10 disabled:opacity-50"
                          >
                            {applying ? "Applying..." : "Apply Now"}
                          </button>
                        )}
                      </div>

                      {applyError && (
                        <p className="mt-2 text-sm text-red-300">{String(applyError)}</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {!user && (
                <Link
                  to="/register"
                  className="mt-8 inline-block rounded-lg bg-emerald-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400"
                >
                  Sign Up to Apply
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}