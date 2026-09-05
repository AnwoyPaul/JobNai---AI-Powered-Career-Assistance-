import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";

export default function ResumeUpload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    if (file.type !== "application/pdf") {
      setError("Only PDF files are accepted.");
      return;
    }

    setError("");
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const { data } = await api.post("/resumes/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate("/resume/review", { state: { profileId: data.profileId, extracted: data.extracted } });
    } catch (err) {
      setError(err.response?.data || "Upload failed. Make sure the backend and Ollama are running.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-8">
          <div className="mb-2 inline-block rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
            Step 1 of 2
          </div>
          <h1 className="text-3xl font-bold mb-2">Upload Your Resume</h1>
          <p className="text-slate-400 mb-6">PDF format only. Our AI will extract your skills, education, experience, and projects.</p>

          {error && (
            <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {String(error)}
            </p>
          )}

          <form onSubmit={handleUpload} className="space-y-4">
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-300 file:mr-4 file:rounded-md file:border-0 file:bg-emerald-500 file:px-4 file:py-2 file:text-slate-950 file:font-semibold"
            />

            <button
              type="submit"
              disabled={!file || uploading}
              className="w-full rounded-lg bg-emerald-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
            >
              {uploading ? "Analyzing resume (this can take 1-2 min)..." : "Upload & Analyze"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}