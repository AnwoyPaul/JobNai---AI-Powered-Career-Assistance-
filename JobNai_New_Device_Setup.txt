# Setting Up JobNai on a New Device

This walks through everything needed to get the project running on a fresh machine, based on what we actually had to fix the first time — so you can skip the trial and error.

---

## 1. Install Prerequisites

| Tool | Where to get it | Notes |
|---|---|---|
| .NET 9 SDK | https://dotnet.microsoft.com/download | Verify with `dotnet --version` — should show `9.0.x` |
| PostgreSQL | https://www.postgresql.org/download/ | Remember the password you set for the `postgres` user |
| Node.js | https://nodejs.org/ | LTS version is fine |
| Ollama | https://ollama.com/ | Verify with `ollama --version` |
| Git | https://git-scm.com/ | For cloning the repo |

**Check your RAM before picking a model.** If the machine has 8GB or less, use `llama3.2` (3B) — anything bigger (like `llama3.1` 8B) will be painfully slow or fail to load. If the new device has 16GB+, `llama3.1` will give noticeably better output quality.

```cmd
ollama pull llama3.2
```

If you use a different model name, remember to update the `Model` constant in `OllamaService.cs`, `MatchingService.cs`, `CoverLetterService.cs`, and `ChatService.cs` to match.

---

## 2. Clone the Repository

```cmd
cd C:\Wherever\You\Want\It
git clone https://github.com/Barrun-Kabir-Rifat/JobNai-An-Ai-Powered-Job-Assistant.git JobNai
cd JobNai
```

---

## 3. Create the Database

```cmd
psql -U postgres -c "CREATE DATABASE jobnai;"
```

---

## 4. Backend Setup

```cmd
cd backend\JobNai.Api
```

**4a. Create your local config from the template:**

```cmd
copy appsettings.Development.json.example appsettings.Development.json
notepad appsettings.Development.json
```

Fill in:
- `ConnectionStrings:DefaultConnection` — your real PostgreSQL password
- `Jwt:Key` — any random string, at least 32 characters (this doesn't need to match your other machine's key unless you want tokens to be interchangeable between devices, which you don't)

**4b. Restore and build:**

```cmd
cd ..\..
dotnet build
```

If this fails with a `NU1100`/package resolution error, it's almost certainly a NuGet package-source-mapping issue (this bit us during initial setup). Check:

```cmd
notepad %AppData%\NuGet\NuGet.Config
```

If there's a `<packageSourceMapping>` block restricting `nuget.org` to a specific list of packages, either delete that whole block, or add `<package pattern="*" />` as the very first entry inside the `nuget.org` `<packageSource>` block.

**4c. Apply migrations:**

```cmd
cd JobNai.Api
dotnet ef database update -p ..\JobNai.Infrastructure -s .
```

If `dotnet ef` isn't recognized:

```cmd
dotnet tool install --global dotnet-ef --version 9.0.11
```

**4d. Run it:**

```cmd
dotnet run
```

Should say `Now listening on: http://localhost:5268`.

---

## 5. Frontend Setup

Open a **new** terminal window (leave the backend running):

```cmd
cd JobNai\frontend
npm install
npm run dev
```

Should say `Local: http://localhost:5173/`.

---

## 6. Verify Everything Works

1. Open `http://localhost:5173` in a browser.
2. Register a new account.
3. Log in, upload a resume, confirm the AI extraction completes (expect it to take 20 seconds to a few minutes depending on the new machine's CPU/RAM).
4. Browse `/jobs` — note this will show an **empty list** on a fresh database, since job postings are per-database. You'll need to register an Employer account and create/publish at least one posting to have anything to browse or match against.

To create an Admin account (not available via the public Register form):

```cmd
curl -X POST http://localhost:5268/api/auth/register -H "Content-Type: application/json" -d "{\"fullName\":\"Admin\",\"email\":\"admin@jobnai.com\",\"password\":\"YourPassword1!\",\"role\":\"Admin\"}"
```

---

## Known Pitfalls (from our first setup — avoid repeating these)

- **`UglyToad.PdfPig` has no stable release** — if `dotnet add package UglyToad.PdfPig` fails with "no stable versions available," add `--prerelease` to the install command. This should already be locked into the `.csproj` from the repo, so you likely won't hit this unless you're re-adding it manually.
- **`Npgsql.EntityFrameworkCore.PostgreSQL` uses its own version numbering**, not matched to Microsoft's EF Core versions (e.g. `9.0.4`, not `9.0.11`). Already pinned correctly in the `.csproj` files in the repo.
- **Two terminals running `dotnet build`/`dotnet run` in the same project folder will file-lock each other.** Always stop `dotnet run` (Ctrl+C) before running `dotnet build` or EF migration commands in the same project.
- **Cover letter / chat / matching endpoints are genuinely slow on CPU-only, low-RAM machines** — several minutes is normal for a 3B model on 8GB RAM. This isn't a bug; give it time before assuming something's broken.

---

## What Doesn't Transfer Automatically

Since each device has its own local PostgreSQL instance, the following do **not** carry over from your original machine — they're specific to whichever database you're pointed at:

- User accounts (you'll need to re-register, including the Admin account)
- Job postings
- Uploaded resumes and confirmed profiles
- Cover letters and applications

If you want the *same* data on both devices, you'd need to either dump/restore the PostgreSQL database (`pg_dump` / `pg_restore`) or point both devices at one shared remote database instead of two separate local ones — a bigger step, worth doing only if you actually need synced data rather than just running the app independently on each machine.
