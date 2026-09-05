import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import ResumeUpload from "./pages/ResumeUpload";
import ResumeReview from "./pages/ResumeReview";
import EmployerDashboard from "./pages/EmployerDashboard";
import JobPostingForm from "./pages/JobPostingForm";
import JobListings from "./pages/JobListings";
import JobDetail from "./pages/JobDetail";
import MyMatches from "./pages/MyMatches";
import CoverLetterPage from "./pages/CoverLetterPage";
import AdminDashboard from "./pages/AdminDashboard";
import JobApplicants from "./pages/JobApplicants";
import ChatWidget from "./components/ChatWidget";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/resume/upload" element={<ProtectedRoute><ResumeUpload /></ProtectedRoute>} />
        <Route path="/resume/review" element={<ProtectedRoute><ResumeReview /></ProtectedRoute>} />

        <Route
          path="/employer/postings/:id/applicants"
          element={
            <ProtectedRoute allowedRoles={["Employer"]}>
              <JobApplicants />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employer/dashboard"
          element={
            <ProtectedRoute allowedRoles={["Employer"]}>
              <EmployerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cover-letter"
          element={
            <ProtectedRoute allowedRoles={["JobSeeker"]}>
              <CoverLetterPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/matches"
          element={
            <ProtectedRoute allowedRoles={["JobSeeker"]}>
              <MyMatches />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employer/postings/new"
          element={
            <ProtectedRoute allowedRoles={["Employer"]}>
              <JobPostingForm />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employer/postings/:id/edit"
          element={
            <ProtectedRoute allowedRoles={["Employer"]}>
              <JobPostingForm />
            </ProtectedRoute>
          }
        />
        <Route path="/jobs" element={<JobListings />} />
        <Route path="/jobs/:id" element={<JobDetail />} />
      </Routes>
      <ChatWidget />
    </>
  );
}

export default App;