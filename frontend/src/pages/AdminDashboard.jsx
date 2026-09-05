import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
//curl -X POST http://localhost:5268/api/auth/register -H "Content-Type: application/json" -d "{\"fullName\":\"YOUR_NAME\",\"email\":\"YOUR_EMAIL@jobnai.com\",\"password\":\"YOUR_PASSWORD\",\"role\":\"Admin\"}"  

export default function AdminDashboard() {
  const [tab, setTab] = useState("analytics");
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [postings, setPostings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAnalytics = () => {
    api.get("/admin/analytics").then(({ data }) => setAnalytics(data));
  };

  const loadUsers = () => {
    api.get("/admin/users").then(({ data }) => setUsers(data));
  };

  const loadPostings = () => {
    api.get("/jobpostings/admin/all").then(({ data }) => setPostings(data));
  };

  useEffect(() => {
    setLoading(true);
    setError("");
    Promise.all([
      api.get("/admin/analytics").then(({ data }) => setAnalytics(data)),
      api.get("/admin/users").then(({ data }) => setUsers(data)),
      api.get("/jobpostings/admin/all").then(({ data }) => setPostings(data)),
    ])
      .catch(() => setError("Failed to load admin data."))
      .finally(() => setLoading(false));
  }, []);

  const toggleSuspend = async (user) => {
    if (user.isLockedOut) {
      await api.post(`/admin/users/${user.id}/unsuspend`);
    } else {
      await api.post(`/admin/users/${user.id}/suspend`);
    }
    loadUsers();
  };

  const deleteUser = async (user) => {
    if (!window.confirm(`Permanently delete ${user.fullName} (${user.email})? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/users/${user.id}`);
      loadUsers();
      loadAnalytics();
    } catch (err) {
      alert(err.response?.data || "Failed to delete user.");
    }
  };

  const removePosting = async (posting) => {
    if (!window.confirm(`Remove posting "${posting.title}"? This cannot be undone.`)) return;
    await api.delete(`/jobpostings/${posting.id}/admin-remove`);
    loadPostings();
    loadAnalytics();
  };

  const statusLabel = { 0: "Draft", 1: "Published", 2: "Closed" };

  const tabClass = (t) =>
    `px-4 py-2 rounded-lg text-sm font-semibold transition ${
      tab === t ? "bg-emerald-500 text-slate-950" : "text-slate-400 hover:text-white"
    }`;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <div className="px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="mb-2 inline-block rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
            Admin
          </div>
          <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

          <div className="flex gap-2 mb-8 border-b border-slate-800 pb-4">
            <button onClick={() => setTab("analytics")} className={tabClass("analytics")}>Analytics</button>
            <button onClick={() => setTab("users")} className={tabClass("users")}>Users</button>
            <button onClick={() => setTab("jobs")} className={tabClass("jobs")}>Job Postings</button>
          </div>

          {loading && <p className="text-slate-500">Loading...</p>}
          {error && <p className="text-red-400">{error}</p>}

          {!loading && tab === "analytics" && analytics && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <StatCard label="Total Users" value={analytics.totalUsers} />
              <StatCard label="Job Seekers" value={analytics.totalJobSeekers} />
              <StatCard label="Employers" value={analytics.totalEmployers} />
              <StatCard label="Admins" value={analytics.totalAdmins} />
              <StatCard label="Job Postings" value={analytics.totalJobPostings} />
              <StatCard label="Published" value={analytics.publishedJobPostings} />
              <StatCard label="Drafts" value={analytics.draftJobPostings} />
              <StatCard label="Closed" value={analytics.closedJobPostings} />
              <StatCard label="Resumes Uploaded" value={analytics.totalResumesUploaded} />
              <StatCard label="Confirmed Resumes" value={analytics.confirmedResumes} />
              <StatCard label="Cover Letters Generated" value={analytics.totalCoverLettersGenerated} />
            </div>
          )}

          {!loading && tab === "users" && (
            <div className="space-y-3">
              {users.map((u) => (
                <div key={u.id} className="rounded-xl border border-slate-800 bg-slate-900 p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{u.fullName} <span className="text-slate-500 font-normal">({u.role})</span></p>
                    <p className="text-sm text-slate-400">{u.email}</p>
                    {u.isLockedOut && (
                      <span className="inline-block mt-1 rounded-full border border-red-400/30 bg-red-400/10 px-2 py-0.5 text-xs text-red-300">
                        Suspended
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleSuspend(u)}
                      className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-800"
                    >
                      {u.isLockedOut ? "Unsuspend" : "Suspend"}
                    </button>
                    <button
                      onClick={() => deleteUser(u)}
                      className="rounded-lg border border-red-500/40 px-3 py-1.5 text-sm text-red-300 hover:bg-red-500/10"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && tab === "jobs" && (
            <div className="space-y-3">
              {postings.map((p) => (
                <div key={p.id} className="rounded-xl border border-slate-800 bg-slate-900 p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{p.title}</p>
                    <p className="text-sm text-slate-500">{statusLabel[p.status]} · posted by employer {p.employerId.slice(0, 8)}...</p>
                  </div>
                  <button
                    onClick={() => removePosting(p)}
                    className="rounded-lg border border-red-500/40 px-3 py-1.5 text-sm text-red-300 hover:bg-red-500/10"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
      <p className="text-2xl font-bold text-emerald-400">{value}</p>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
    </div>
  );
}