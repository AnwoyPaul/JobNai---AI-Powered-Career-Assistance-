import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

export default function CoverLetterPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [coverLetter, setCoverLetter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [prepLoading, setPrepLoading] = useState(false);
  const [editInstructions, setEditInstructions] = useState("");
  const [error, setError] = useState("");

  const jobPostingId = state?.jobPostingId;
  const jobTitle = state?.jobTitle;

  const generate = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/coverletters/generate", { jobPostingId });
      setCoverLetter(data);
    } catch (err) {
      setError(err.response?.data || "Failed to generate cover letter.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (jobPostingId) {
      generate();
    } else {
      setLoading(false);
    }
  }, []);

  const regenerate = async () => {
    if (!editInstructions.trim()) return;
    setRegenerating(true);
    setError("");
    try {
      const { data } = await api.post(`/coverletters/${coverLetter.id}/regenerate`, {
        editInstructions,
      });
      setCoverLetter(data);
      setEditInstructions("");
    } catch (err) {
      setError(err.response?.data || "Failed to regenerate.");
    } finally {
      setRegenerating(false);
    }
  };

  const getInterviewPrep = async () => {
    setPrepLoading(true);
    setError("");
    try {
      const { data } = await api.post(`/coverletters/${coverLetter.id}/interview-prep`);
      setCoverLetter(data);
    } catch (err) {
      setError(err.response?.data || "Failed to generate interview prep.");
    } finally {
      setPrepLoading(false);
    }
  };

  // No state means someone navigated here directly without picking a job — bounce back
  if (!jobPostingId && !coverLetter) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <Navbar />
        <div className="px-6 py-16 text-center">
          <p className="text-slate-400 mb-4">No job selected.</p>
          <Link to="/jobs" className="text-emerald-400 hover:underline">Browse jobs</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <div className="px-6 py-16">
        <div className="mx-auto max-w-2xl">
          <div className="mb-2 inline-block rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
            Cover Letter
          </div>
          <h1 className="text-3xl font-bold mb-2">
            {jobTitle ? `For: ${jobTitle}` : "Cover Letter"}
          </h1>

          {error && (
            <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {String(error)}
            </p>
          )}

          {!coverLetter && !loading && (
            <button
              onClick={generate}
              className="rounded-lg bg-emerald-500 px-6 py-3 font-semibold text-slate-950 hover:bg-emerald-400"
            >
              Generate Cover Letter
            </button>
          )}

          {loading && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-400">
              Generating your cover letter... this can take a few minutes on local AI.
            </div>
          )}

          {coverLetter && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 whitespace-pre-wrap leading-relaxed text-slate-200">
                {coverLetter.content}
                {"\n\n" + (user?.fullName || "")}
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <h3 className="text-sm font-semibold text-emerald-400 mb-3">Request Edits</h3>
                <textarea
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-emerald-400 mb-3"
                  rows={2}
                  placeholder='e.g. "Make it shorter" or "Sound more enthusiastic"'
                  value={editInstructions}
                  onChange={(e) => setEditInstructions(e.target.value)}
                />
                <button
                  onClick={regenerate}
                  disabled={regenerating || !editInstructions.trim()}
                  className="rounded-lg bg-emerald-500 px-5 py-2.5 font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
                >
                  {regenerating ? "Regenerating..." : "Regenerate"}
                </button>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <h3 className="text-sm font-semibold text-emerald-400 mb-3">Interview Preparation</h3>

                {!coverLetter.interviewPrepContent && (
                  <button
                    onClick={getInterviewPrep}
                    disabled={prepLoading}
                    className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm text-slate-300 hover:bg-slate-800 disabled:opacity-50"
                  >
                    {prepLoading ? "Generating questions..." : "Generate Interview Questions"}
                  </button>
                )}

                {coverLetter.interviewPrepContent && (
                  <div className="whitespace-pre-wrap text-sm text-slate-300 leading-relaxed">
                    {coverLetter.interviewPrepContent}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}