import { Link, Navigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Landing() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const stay = searchParams.get("stay") === "true";

  if (user && !stay) {
    const target =
      user.role === "Employer" ? "/employer/dashboard" :
      user.role === "Admin" ? "/admin/dashboard" :
      "/dashboard";
    return <Navigate to={target} replace />;
  }

  return (
    <div className="min-h-screen bg-[#030712] text-slate-50 font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      
      {/* 
        ========================================
        HERO SECTION
        ========================================
      */}
      <section className="relative pt-24 pb-20 lg:pt-40 lg:pb-28">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[120px]" />
          <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-cyan-500/10 blur-[120px]" />
        </div>

        <div className="mx-auto max-w-7xl px-6 lg:flex lg:items-center lg:gap-16">
          {/* Left: Copy & CTAs */}
          <div className="lg:w-1/2 text-center lg:text-left z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-8">
              <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></span>
              JobNai - AI Powered Career Assistance
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
              Land your next role with <br className="hidden lg:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500">
                AI precision.
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Stop guessing if your resume is good enough. Get instant match scores, uncover missing skills, and let AI optimize your applications for the jobs you actually want.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link 
                to="/register?role=JobSeeker" 
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] hover:-translate-y-0.5"
              >
                Get Started Free
              </Link>
              <Link 
                to="/jobs" 
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700 text-white font-semibold transition-all backdrop-blur-sm"
              >
                Browse Jobs
              </Link>
              
            </div>
            <p className="mt-5 text-sm text-slate-500">No credit card required. Setup in 60 seconds.</p>
          </div>

          {/* Right: Abstract UI Mockup */}
          <div className="lg:w-1/2 relative mt-20 lg:mt-0 z-10 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-lg">
              
              {/* Background Mockup Card */}
              <div className="absolute top-12 -left-4 md:-left-12 w-full rounded-2xl bg-slate-900 border border-slate-800 p-6 opacity-60 scale-95 rotate-[-3deg] blur-[1px]">
                <div className="h-4 w-1/3 bg-slate-800 rounded mb-4"></div>
                <div className="h-3 w-full bg-slate-800 rounded mb-2"></div>
                <div className="h-3 w-4/5 bg-slate-800 rounded mb-2"></div>
                <div className="h-3 w-2/3 bg-slate-800 rounded"></div>
              </div>

              {/* Main Foreground Card */}
              <div className="relative rounded-2xl bg-slate-900/80 border border-slate-700 p-8 shadow-2xl backdrop-blur-xl">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">Software Engineer</h3>
                    <p className="text-cyan-400 text-sm font-medium">FinTech Solutions Ltd.</p>
                  </div>
                  <div className="text-right">
                    <span className="block text-4xl font-black text-white">94<span className="text-2xl text-slate-500">%</span></span>
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Match Score</span>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-300">Resume Compatibility</span>
                    <span className="text-indigo-400 font-medium">Excellent</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 w-[94%] rounded-full"></div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">Matched Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {['C#', 'Python', 'SQL', 'REST APIs', 'System Design'].map((skill) => (
                        <span key={skill} className="px-3 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">Skill Gaps</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium">
                        Missing: Docker
                      </span>
                    </div>
                  </div>
                </div>

              </div>
              

              
              {/* Floating Element */}
              <div className="absolute -bottom-6 -right-6 rounded-xl bg-slate-800 border border-slate-700 p-4 shadow-xl flex items-center gap-4 animate-bounce" style={{ animationDuration: '3s' }}>
                <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Cover Letter Ready</p>
                  <p className="text-xs text-slate-400">Generated 2 mins ago</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 
        ========================================
        HOW IT WORKS
        ========================================
      */}
      <section className="py-24 bg-slate-900/30 border-y border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Your career on autopilot</h2>
            <p className="text-slate-400 text-lg">We handle the analysis, matching, and drafting. You focus on acing the interview.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-px bg-gradient-to-r from-slate-800 via-indigo-500/50 to-slate-800 z-0"></div>

            {[
              { step: "1", title: "Drop your Resume", desc: "Upload your PDF. Our AI instantly maps your technical stack, experience, and educational background." },
              { step: "2", title: "Discover Matches", desc: "We scan active job boards and score your profile against open roles so you know exactly where you stand." },
              { step: "3", title: "Apply with Confidence", desc: "Generate highly personalized cover letters and get custom interview questions based on your skill gaps." }
            ].map((item, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center text-center p-6">
                <div className="h-16 w-16 rounded-full bg-slate-950 border-2 border-indigo-500 flex items-center justify-center text-xl font-black text-indigo-400 mb-6 shadow-[0_0_15px_rgba(79,70,229,0.2)]">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-50">{item.title}</h3>
                <p className="text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 
        ========================================
        DUAL AUDIENCE (BENTO GRID STYLE)
        ========================================
      */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-8">
            
            {/* Seeker Box */}
            <div className="relative rounded-3xl bg-slate-900 border border-slate-800 p-8 md:p-12 overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl"></div>
              <div>
                <span className="text-indigo-400 font-semibold tracking-wider uppercase text-sm">For Job Seekers</span>
                <h2 className="text-3xl font-bold mt-2 mb-4 text-white">Stop sending resumes into the void.</h2>
                <p className="text-slate-400 mb-8 text-lg">
                  Get actionable data before you click apply. Know your match percentage, upskill exactly where needed, and generate tailored application materials in seconds.
                </p>
                <ul className="space-y-3 mb-10">
                  {['Automated skill extraction', 'Real-time job match scoring', 'AI Cover Letter generation'].map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-300">
                      <svg className="w-5 h-5 text-indigo-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <Link to="/register?role=JobSeeker" className="inline-block w-fit px-6 py-3 rounded-lg bg-white text-slate-950 font-bold hover:bg-slate-200 transition-colors">
                Create Seeker Profile
              </Link>
            </div>

            {/* Employer Box */}
            <div className="relative rounded-3xl bg-slate-900 border border-slate-800 p-8 md:p-12 overflow-hidden flex flex-col justify-between">
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl"></div>
              <div>
                <span className="text-cyan-400 font-semibold tracking-wider uppercase text-sm">For Employers</span>
                <h2 className="text-3xl font-bold mt-2 mb-4 text-white">Hire the top 1%, 10x faster.</h2>
                <p className="text-slate-400 mb-8 text-lg">
                  Stop sifting through hundreds of unqualified applications. Candidates are pre-scored against your exact job requirements before they even hit your inbox.
                </p>
                <ul className="space-y-3 mb-10">
                  {['Post jobs with automated requirement parsing', 'Receive ranked applicant lists instantly', 'Reduce time-to-hire by 60%'].map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-300">
                      <svg className="w-5 h-5 text-cyan-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <Link 
                to="/register?role=Employer" 
                className="relative z-10 inline-block w-fit px-6 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white font-bold hover:bg-slate-700 transition-colors"
              >
                Post a Job Opening
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* 
        ========================================
        BOTTOM CTA
        ========================================
      */}
      <section className="pb-24 px-6">
        <div className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-br from-indigo-900/40 via-slate-900 to-cyan-900/40 border border-indigo-500/20 p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 relative z-10">Ready to find your perfect match?</h2>
          <p className="text-indigo-200 mb-10 text-lg max-w-xl mx-auto relative z-10">
            Join thousands of developers and tech professionals using JobNai to accelerate their career search.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
            <Link to="/register" className="px-8 py-4 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold transition-colors">
              Create your free account
            </Link>
            <Link to="/login" className="px-8 py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}

export default Landing;