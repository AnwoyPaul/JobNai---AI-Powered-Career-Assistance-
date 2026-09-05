import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
export default function Dashboard() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/resumes/mine")
      .then(({ data }) => setProfile(data))
      .catch(() => setProfile(null)) // 404 if no resume uploaded yet — that's fine
      .finally(() => setLoading(false));
  }, []);
  

  const skills = profile ? JSON.parse(profile.skills) : [];
  const education = profile ? JSON.parse(profile.education) : [];
  const experience = profile ? JSON.parse(profile.experience) : [];
  const projects = profile ? JSON.parse(profile.projects) : [];
  const achievements = profile ? JSON.parse(profile.achievements) : [];

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-16">
      <Navbar />
      <br></br>
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 inline-block rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
          
          Dashboard
        </div>
        <h1 className="text-3xl font-bold mb-1">Welcome, {user?.fullName}</h1>
        <p className="text-slate-400 mb-8">Signed in as {user?.email} · {user?.role}</p>

        {loading && <p className="text-slate-500">Loading your profile...</p>}

        {!loading && !profile && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-slate-400 mb-4">You haven't uploaded a resume yet.</p>
            <Link
              to="/resume/upload"
              className="inline-block rounded-lg bg-emerald-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400"
            >
              Upload Resume
            </Link>
          </div>
        )}

        {!loading && profile && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-emerald-400">Your Profile</h2>
                {profile.isConfirmed ? (
                  <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300 border border-emerald-400/30">Confirmed</span>
                ) : (
                  <span className="rounded-full bg-yellow-400/10 px-3 py-1 text-xs text-yellow-300 border border-yellow-400/30">Pending Review</span>
                )}
              </div>
              <p className="text-sm text-slate-500 mb-4">From: {profile.originalFileName}</p>

              <h3 className="text-sm font-semibold text-slate-300 mb-1">Skills</h3>
              <p className="text-slate-400 mb-4">{skills.join(", ") || "—"}</p>

              <h3 className="text-sm font-semibold text-slate-300 mb-1">Education</h3>
              {education.length === 0 && <p className="text-slate-500 text-sm mb-4">—</p>}
              {education.map((ed, i) => (
                <p key={i} className="text-slate-400 mb-1">{ed.degree} · {ed.institution} · {ed.year}</p>
              ))}

              <h3 className="text-sm font-semibold text-slate-300 mt-4 mb-1">Experience</h3>
              {experience.length === 0 && <p className="text-slate-500 text-sm mb-4">—</p>}
              {experience.map((exp, i) => (
                <p key={i} className="text-slate-400 mb-1">{exp.title} at {exp.company}</p>
              ))}

              <h3 className="text-sm font-semibold text-slate-300 mt-4 mb-1">Projects</h3>
              {projects.map((p, i) => (
                <div key={i} className="mb-2">
                  <p className="text-slate-300 font-medium">{p.name}</p>
                  <p className="text-slate-500 text-sm">{p.description}</p>
                </div>
              ))}

              <h3 className="text-sm font-semibold text-slate-300 mt-4 mb-1">Achievements</h3>
              <ul className="list-disc list-inside text-slate-400 text-sm">
                {achievements.map((a, i) => <li key={i}>{a}</li>)}
              </ul>

              <Link
                to="/resume/upload"
                className="mt-6 inline-block rounded-lg border border-slate-700 px-5 py-2 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
              >
                Upload New Resume
              </Link>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          className="mt-8 rounded-lg border border-slate-700 px-6 py-3 font-semibold text-slate-300 transition hover:bg-slate-900"
        >
          Logout
        </button>
      </div>
    </main>
  );
}