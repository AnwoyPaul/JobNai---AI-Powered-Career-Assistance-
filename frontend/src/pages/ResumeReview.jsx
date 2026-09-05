import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";

export default function ResumeReview() {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state) {
    navigate("/resume/upload");
    return null;
  }

  const [skills, setSkills] = useState((state.extracted.skills || []).join(", "));
  const [education, setEducation] = useState(state.extracted.education || []);
  const [experience, setExperience] = useState(state.extracted.experience || []);
  const [projects, setProjects] = useState(state.extracted.projects || []);
  const [achievements, setAchievements] = useState((state.extracted.achievements || []).join("\n"));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const updateField = (list, setList, index, key, value) => {
    const copy = [...list];
    copy[index] = { ...copy[index], [key]: value };
    setList(copy);
  };

  const handleConfirm = async () => {
    setSaving(true);
    setError("");
    try {
      await api.post(`/resumes/${state.profileId}/confirm`, {
        skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
        education,
        experience,
        projects,
        achievements: achievements.split("\n").map((a) => a.trim()).filter(Boolean),
      });
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <div className="px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <div className="mb-2 inline-block rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
            Step 2 of 2
          </div>
          <h1 className="text-3xl font-bold mb-2">Review Extracted Data</h1>
          <p className="text-slate-400 mb-8">
            Our AI pulled the following from your resume. Edit anything before saving to your profile.
          </p>

          {error && (
            <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {String(error)}
            </p>
          )}

          {/* Skills */}
          <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-lg font-semibold text-emerald-400 mb-3">Skills</h2>
            <textarea
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400"
              rows={2}
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="Comma-separated skills"
            />
          </section>

          {/* Education */}
          <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-lg font-semibold text-emerald-400 mb-3">Education</h2>
            {education.length === 0 && <p className="text-slate-500 text-sm">No education entries extracted.</p>}
            {education.map((ed, i) => (
              <div key={i} className="mb-3 grid grid-cols-3 gap-2">
                <input className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                  placeholder="Degree" value={ed.degree || ""} onChange={(e) => updateField(education, setEducation, i, "degree", e.target.value)} />
                <input className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                  placeholder="Institution" value={ed.institution || ""} onChange={(e) => updateField(education, setEducation, i, "institution", e.target.value)} />
                <input className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                  placeholder="Year" value={ed.year || ""} onChange={(e) => updateField(education, setEducation, i, "year", e.target.value)} />
              </div>
            ))}
          </section>

          {/* Experience */}
          <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-lg font-semibold text-emerald-400 mb-3">Experience</h2>
            {experience.length === 0 && <p className="text-slate-500 text-sm">No experience entries extracted.</p>}
            {experience.map((exp, i) => (
              <div key={i} className="mb-3 grid grid-cols-2 gap-2">
                <input className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                  placeholder="Title" value={exp.title || ""} onChange={(e) => updateField(experience, setExperience, i, "title", e.target.value)} />
                <input className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                  placeholder="Company" value={exp.company || ""} onChange={(e) => updateField(experience, setExperience, i, "company", e.target.value)} />
              </div>
            ))}
          </section>

          {/* Projects */}
          <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-lg font-semibold text-emerald-400 mb-3">Projects</h2>
            {projects.map((p, i) => (
              <div key={i} className="mb-3">
                <input className="mb-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                  placeholder="Project name" value={p.name || ""} onChange={(e) => updateField(projects, setProjects, i, "name", e.target.value)} />
                <textarea className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                  rows={2} placeholder="Description" value={p.description || ""} onChange={(e) => updateField(projects, setProjects, i, "description", e.target.value)} />
              </div>
            ))}
          </section>

          {/* Achievements */}
          <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-lg font-semibold text-emerald-400 mb-3">Achievements</h2>
            <textarea
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400"
              rows={4}
              value={achievements}
              onChange={(e) => setAchievements(e.target.value)}
              placeholder="One achievement per line"
            />
          </section>

          <button
            onClick={handleConfirm}
            disabled={saving}
            className="w-full rounded-lg bg-emerald-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Confirm & Save Profile"}
          </button>
        </div>
      </div>
    </main>
  );
}