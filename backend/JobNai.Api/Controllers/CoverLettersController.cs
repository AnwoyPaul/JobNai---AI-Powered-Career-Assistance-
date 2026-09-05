using JobNai.Application.DTOs;
using JobNai.Application.Services;
using JobNai.Domain.Entities;
using JobNai.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json;

namespace JobNai.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "JobSeeker")]
public class CoverLettersController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ICoverLetterService _coverLetterService;
    private readonly IMatchingService _matching;

    public CoverLettersController(AppDbContext db, ICoverLetterService coverLetterService, IMatchingService matching)
    {
        _db = db;
        _coverLetterService = coverLetterService;
        _matching = matching;
    }

    private string CurrentUserId => User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? User.FindFirstValue("sub")!;

    private string BuildResumeSummary(Domain.Entities.ResumeProfile resume)
    {
        var skills = JsonSerializer.Deserialize<List<string>>(resume.Skills) ?? new();
        var education = JsonSerializer.Deserialize<List<Dictionary<string, string>>>(resume.Education) ?? new();
        var experience = JsonSerializer.Deserialize<List<Dictionary<string, string>>>(resume.Experience) ?? new();
        var projects = JsonSerializer.Deserialize<List<Dictionary<string, string>>>(resume.Projects) ?? new();

        var sb = new System.Text.StringBuilder();
        sb.AppendLine($"Skills: {string.Join(", ", skills)}");
        foreach (var e in education) sb.AppendLine($"Education: {e.GetValueOrDefault("degree")} - {e.GetValueOrDefault("institution")}");
        foreach (var ex in experience) sb.AppendLine($"Experience: {ex.GetValueOrDefault("title")} at {ex.GetValueOrDefault("company")}");
        foreach (var p in projects) sb.AppendLine($"Project: {p.GetValueOrDefault("name")} - {p.GetValueOrDefault("description")}");

        return sb.ToString();
    }

    // Generate a new cover letter draft for a job posting
    [HttpPost("generate")]
    public async Task<IActionResult> Generate(GenerateCoverLetterRequest request)
    {
        var posting = await _db.JobPostings.FindAsync(request.JobPostingId);
        if (posting == null) return NotFound("Job posting not found.");

        var resume = await _db.ResumeProfiles
            .Where(r => r.UserId == CurrentUserId && r.IsConfirmed)
            .OrderByDescending(r => r.UploadedAt)
            .FirstOrDefaultAsync();

        if (resume == null)
            return BadRequest("Upload and confirm a resume before generating a cover letter.");

        var resumeSummary = BuildResumeSummary(resume);
        var content = await _coverLetterService.GenerateCoverLetterAsync(resumeSummary, posting.Title, posting.Description);

        var coverLetter = new CoverLetter
        {
            UserId = CurrentUserId,
            JobPostingId = posting.Id,
            Content = content
        };

        _db.CoverLetters.Add(coverLetter);
        await _db.SaveChangesAsync();

        return Ok(coverLetter);
    }

    // Regenerate an existing draft with edit instructions
    [HttpPost("{id}/regenerate")]
    public async Task<IActionResult> Regenerate(int id, RegenerateCoverLetterRequest request)
    {
        var coverLetter = await _db.CoverLetters.FirstOrDefaultAsync(c => c.Id == id && c.UserId == CurrentUserId);
        if (coverLetter == null) return NotFound();

        coverLetter.Content = await _coverLetterService.RegenerateCoverLetterAsync(coverLetter.Content, request.EditInstructions);
        coverLetter.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok(coverLetter);
    }

    // Generate interview prep questions for this cover letter's job posting
    [HttpPost("{id}/interview-prep")]
    public async Task<IActionResult> InterviewPrep(int id)
    {
        var coverLetter = await _db.CoverLetters
            .Include(c => c.JobPosting)
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == CurrentUserId);

        if (coverLetter == null) return NotFound();

        var resume = await _db.ResumeProfiles
            .Where(r => r.UserId == CurrentUserId && r.IsConfirmed)
            .OrderByDescending(r => r.UploadedAt)
            .FirstOrDefaultAsync();

        var missingSkills = new List<string>();
        if (resume != null)
        {
            var resumeSkills = JsonSerializer.Deserialize<List<string>>(resume.Skills) ?? new();
            var requiredSkills = JsonSerializer.Deserialize<List<string>>(coverLetter.JobPosting.RequiredSkills) ?? new();
            (_, _, missingSkills) = _matching.ComputeMatch(resumeSkills, requiredSkills);
        }

        coverLetter.InterviewPrepContent = await _coverLetterService.GenerateInterviewPrepAsync(
            coverLetter.JobPosting.Title, coverLetter.JobPosting.Description, missingSkills);
        coverLetter.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok(coverLetter);
    }

    // Get one cover letter
    [HttpGet("{id}")]
    public async Task<IActionResult> GetOne(int id)
    {
        var coverLetter = await _db.CoverLetters.FirstOrDefaultAsync(c => c.Id == id && c.UserId == CurrentUserId);
        if (coverLetter == null) return NotFound();
        return Ok(coverLetter);
    }

    // List all of my cover letters
    [HttpGet("mine")]
    public async Task<IActionResult> GetMine()
    {
        var letters = await _db.CoverLetters
            .Include(c => c.JobPosting)
            .Where(c => c.UserId == CurrentUserId)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();

        return Ok(letters);
    }
}