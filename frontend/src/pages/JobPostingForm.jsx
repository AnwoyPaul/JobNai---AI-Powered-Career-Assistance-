import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";

export default function JobPostingForm() {
  const { id } = useParams(); // present only when editing
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit) {
      api.get(`/jobpostings/${id}`).then(({ data }) => {
        setTitle(data.title);
        setDescription(data.description);
        setSkills(JSON.parse(data.requiredSkills || "[]").join(", "));
      });
    }
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    const payload = {
      title,
      description,
      requiredSkills: skills.split(",").map((s) => s.trim()).filter(Boolean),
    };

    try {
      if (isEdit) {
        await api.put(`/jobpostings/${id}`, payload);
      } else {
        await api.post("/jobpostings", payload);
      }
      navigate("/employer/dashboard");
    } catch (err) {
      const data = err.response?.data;
      setError(data?.message ? `${data.message} (${data.fields?.join(", ")})` : "Failed to save posting.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-8">
          <h1 className="text-2xl font-bold mb-6">{isEdit ? "Edit Posting" : "New Job Posting"}</h1>

          {error && (
            <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-emerald-400"
              placeholder="Job Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <textarea
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-emerald-400"
              rows={10}
              placeholder={`Job Summary\n...\n\nKey Responsibilities\n- ...\n- ...\n\nRequired Skills\n- ...`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
            <input
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-emerald-400"
              placeholder="Required skills, comma-separated (e.g. C#, PostgreSQL)"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              required
            />

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-emerald-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
            >
              {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Posting (as Draft)"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}