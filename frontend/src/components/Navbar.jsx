import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const dashboardLink =
  user?.role === "Employer" ? "/employer/dashboard" :
  user?.role === "Admin" ? "/admin/dashboard" :
  "/dashboard";

  return (
    <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-10">
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
       <Link to={user ? "/?stay=true" : "/"} className="text-lg font-bold text-white hover:opacity-80 transition">
          Job<span className="text-emerald-400">Nai</span>
        </Link>

        <div className="flex items-center gap-4 text-sm">
          <Link to={user ? "/?stay=true" : "/"} className="text-slate-300 hover:text-emerald-400">
               Home
           </Link>
          <Link to="/jobs" className="text-slate-300 hover:text-emerald-400">
            Browse Jobs
          </Link>

          {user ? (
            <>
              {user?.role === "JobSeeker" && (
                <Link to="/matches" className="text-slate-300 hover:text-emerald-400">
                  My Matches
                </Link>
              )}
              <Link to={dashboardLink} className="text-slate-300 hover:text-emerald-400">
                Dashboard
              </Link>
              <span className="text-slate-600">|</span>
              <span className="text-slate-500">{user.fullName} ({user.role})</span>
              <button
                onClick={handleLogout}
                className="rounded-lg border border-slate-700 px-4 py-1.5 text-slate-300 hover:bg-slate-800"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-slate-300 hover:text-emerald-400">Login</Link>
              <Link
                to="/register"
                className="rounded-lg bg-emerald-500 px-4 py-1.5 font-semibold text-slate-950 hover:bg-emerald-400"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}