# JobNai

**AI-Powered Job Matching and Career Assistant for Bangladeshi Job Seekers**

A full-stack web platform that uses a locally-hosted LLM to analyze resumes, match job seekers against real job postings with transparent scoring, identify skill gaps, and generate personalized cover letters and interview prep — built as a final year project for CSC 470: Software Engineering Lab, IUBAT.

---

**Submitted to:** Fahim Shakil Tamim, Lecturer, Dept. of CSE, IUBAT

---

## Overview

Job seekers often apply to roles without knowing whether they're actually a good fit, and existing job portals mainly list postings without personalized guidance. JobNai solves this by using AI to read a candidate's resume, compare it against real job postings, and surface a concrete match percentage, matched/missing skills, and actionable next steps — cover letters, interview prep, and learning suggestions — all generated on-demand. All AI processing runs on a locally-hosted LLM rather than a paid third-party API, which keeps resume data private and keeps the match score transparent and reproducible instead of an opaque black-box number.

## Features

### For Job Seekers
- Register/login with JWT-based authentication
- Upload a resume (PDF) — AI extracts skills, education, experience, projects, and achievements
- Review and correct the AI-extracted data before saving to your profile
- Browse published job postings and see a live match score against your resume
- Skill gap breakdown with AI-generated learning suggestions per posting
- Generate, review, and regenerate AI cover letters with custom edit instructions
- Generate interview prep questions tailored to a specific job and your skill gaps
- Apply directly to job postings and track application status

### For Employers
- Create, edit, publish, and close job postings with required skills
- View and manage applicants per posting, with status tracking (Submitted → Reviewed → Accepted/Rejected)

### For Admins
- View, suspend/unsuspend, and delete platform users
- View and remove any job posting
- Platform-wide analytics (users by role, posting status breakdown, resumes uploaded, cover letters generated)

### Platform-wide
- Floating AI help chatbot answering questions about how to use JobNai

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite) + Tailwind CSS |
| Backend | ASP.NET Core Web API (.NET 9), layered architecture (Domain / Application / Infrastructure / Api) |
| Database | PostgreSQL + Entity Framework Core |
| Authentication | ASP.NET Core Identity + JWT |
| AI Model | Ollama running Llama 3.2 (3B), fully local inference |
| Resume Parsing | PdfPig (PDF text extraction) |

## Architecture

```
JobNai/
  backend/
    JobNai.Api/             ASP.NET Core Web API — controllers, JWT/CORS config, entry point
    JobNai.Domain/           Entities: ApplicationUser, ResumeProfile, JobPosting, CoverLetter, JobApplication
    JobNai.Application/      DTOs and service interfaces
    JobNai.Infrastructure/   EF Core DbContext, migrations, Ollama-backed services
  frontend/
    src/
      pages/                 Route-level views (Landing, Dashboard, JobListings, etc.)
      components/            Navbar, ProtectedRoute, ChatWidget
      context/                AuthContext (JWT session state)
      api/                   Axios client with auth interceptor
```

AI features are implemented as separate services (`OllamaService`, `MatchingService`, `CoverLetterService`, `ChatService`) that call a local Ollama instance over HTTP. Match scoring itself is computed deterministically in C# (skill-overlap percentage) for consistency and speed; the AI is used only for extraction, natural-language suggestions, and generated text.

---

## Prerequisites

- [.NET 9 SDK](https://dotnet.microsoft.com/download)
- [PostgreSQL](https://www.postgresql.org/download/) (tested on 18)
- [Ollama](https://ollama.com/) with a model pulled, e.g.:
  ```
  ollama pull llama3.2
  ```
- [Node.js](https://nodejs.org/) (for the frontend)

## Setup

### 1. Database

```bash
psql -U postgres -c "CREATE DATABASE jobnai;"
```

### 2. Backend

```bash
cd backend/JobNai.Api
```

Copy the config template and fill in your own values:

```bash
cp appsettings.Development.json.example appsettings.Development.json
```

Edit `appsettings.Development.json`:
- `ConnectionStrings:DefaultConnection` — set your PostgreSQL password
- `Jwt:Key` — set a random string at least 32 characters long

Apply database migrations:

```bash
dotnet ef database update -p ../JobNai.Infrastructure -s .
```

Run the API:

```bash
dotnet run
```

The API listens on `http://localhost:5268`.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs on `http://localhost:5173`.

### 4. Ollama

Make sure Ollama is running and the model referenced in the backend services (`llama3.2` by default) is pulled locally. AI-dependent requests (resume extraction, matching suggestions, cover letters, chat) are slower on CPU-only hardware — expect anywhere from 20 seconds to a few minutes per request depending on your machine.

---

## Usage Notes

- Roles are `JobSeeker`, `Employer`, and `Admin`. The public registration form only exposes JobSeeker and Employer; an Admin account can be created directly via the API:
  ```bash
  curl -X POST http://localhost:5268/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"fullName":"Admin","email":"admin@example.com","password":"YourPassword1!","role":"Admin"}'
  ```
- A JobSeeker must upload and confirm a resume before match scores, cover letters, or applications become available.
- Skill matching is exact (case-insensitive) string comparison — related terms (e.g. "SQL" vs "PostgreSQL") are treated as distinct skills. This is a deliberate simplicity/transparency trade-off; fuzzy or synonym-based matching is a natural future improvement.

---

## Software Process Model

Developed using an **Incremental Agile** approach, in phases:

1. User Authentication
2. Resume Upload & AI Extraction
3. Job Posting Management
4. AI Job Matching & Skill Gap Analysis
5. Cover Letter & Interview Prep Generation
6. Admin Dashboard & Analytics
7. Job Applications & AI Help Chatbot *(added during development, beyond original scope)*

## Known Limitations / Future Work

- AI inference runs locally and is not currently deployed to a cloud host with sufficient resources — see deployment notes for viable free-tier options (e.g. Oracle Cloud's free ARM tier for Ollama).
- Skill matching does not account for synonyms or related technologies.
- No automated test suite yet.
- No Docker Compose setup yet for one-command startup of the full stack.

---

## License

Academic project — Software Engineering
