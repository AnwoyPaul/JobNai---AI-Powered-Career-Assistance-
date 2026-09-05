using JobNai.Application.DTOs;
using JobNai.Domain.Entities;
using JobNai.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json;
using JobNai.Application.Services;

namespace JobNai.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class JobPostingsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IMatchingService _matching;

    public JobPostingsController(AppDbContext db, IMatchingService matching)
    {
        _db = db;
        _matching = matching;
    }

    private string CurrentUserId => User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? User.FindFirstValue("sub")!;

    // Public: browse published postings only
    [HttpGet]
    public async Task<IActionResult> GetPublished()
    {
        var postings = await _db.JobPostings
            .Where(j => j.Status == JobPostingStatus.Published)
            .OrderByDescending(j => j.PublishedAt)
            .ToListAsync();

        return Ok(postings);
    }

    // Public: view one posting
    [HttpGet("{id}")]
    public async Task<IActionResult> GetOne(int id)
    {
        var posting = await _db.JobPostings.FindAsync(id);
        if (posting == null) return NotFound();
        if (posting.Status != JobPostingStatus.Published && !User.IsInRole("Admin")
            && posting.EmployerId != CurrentUserId)
        {
            return NotFound(); // hide drafts/closed from unrelated users
        }
        return Ok(posting);
    }

    // Employer: my own postings, any status
    [HttpGet("mine")]
    [Authorize(Roles = "Employer")]
    public async Task<IActionResult> GetMine()
    {
        var postings = await _db.JobPostings
            .Where(j => j.EmployerId == CurrentUserId)
            .OrderByDescending(j => j.CreatedAt)
            .ToListAsync();

        return Ok(postings);
    }

    // Employer: create (starts as Draft)
    [HttpPost]
    [Authorize(Roles = "Employer")]
    public async Task<IActionResult> Create(CreateJobPostingRequest request)
    {
        var missing = new List<string>();
        if (string.IsNullOrWhiteSpace(request.Title)) missing.Add("Title");
        if (string.IsNullOrWhiteSpace(request.Description)) missing.Add("Description");
        if (request.RequiredSkills == null || request.RequiredSkills.Count == 0) missing.Add("RequiredSkills");

        if (missing.Count > 0)
            return BadRequest(new { message = "Missing required fields.", fields = missing });

        var posting = new JobPosting
        {
            EmployerId = CurrentUserId,
            Title = request.Title,
            Description = request.Description,
            RequiredSkills = JsonSerializer.Serialize(request.RequiredSkills),
            Status = JobPostingStatus.Draft
        };

        _db.JobPostings.Add(posting);
        await _db.SaveChangesAsync();
        return Ok(posting);
    }

    // Employer: update own posting
    [HttpPut("{id}")]
    [Authorize(Roles = "Employer")]
    public async Task<IActionResult> Update(int id, UpdateJobPostingRequest request)
    {
        var posting = await _db.JobPostings.FirstOrDefaultAsync(j => j.Id == id && j.EmployerId == CurrentUserId);
        if (posting == null) return NotFound();

        posting.Title = request.Title;
        posting.Description = request.Description;
        posting.RequiredSkills = JsonSerializer.Serialize(request.RequiredSkills);

        await _db.SaveChangesAsync();
        return Ok(posting);
    }

    // Employer: publish own posting
    [HttpPost("{id}/publish")]
    [Authorize(Roles = "Employer")]
    public async Task<IActionResult> Publish(int id)
    {
        var posting = await _db.JobPostings.FirstOrDefaultAsync(j => j.Id == id && j.EmployerId == CurrentUserId);
        if (posting == null) return NotFound();

        posting.Status = JobPostingStatus.Published;
        posting.PublishedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok(posting);
    }

    // Employer: close own posting
    [HttpPost("{id}/close")]
    [Authorize(Roles = "Employer")]
    public async Task<IActionResult> Close(int id)
    {
        var posting = await _db.JobPostings.FirstOrDefaultAsync(j => j.Id == id && j.EmployerId == CurrentUserId);
        if (posting == null) return NotFound();

        posting.Status = JobPostingStatus.Closed;
        await _db.SaveChangesAsync();
        return Ok(posting);
    }

    // Admin: view all postings regardless of status
    [HttpGet("admin/all")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAllForAdmin()
    {
        var postings = await _db.JobPostings
            .OrderByDescending(j => j.CreatedAt)
            .ToListAsync();

        return Ok(postings);
    }

    // Admin: remove any posting
    [HttpDelete("{id}/admin-remove")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AdminRemove(int id)
    {
        var posting = await _db.JobPostings.FindAsync(id);
        if (posting == null) return NotFound();

        _db.JobPostings.Remove(posting);
        await _db.SaveChangesAsync();
        return Ok();
    }

    // JobSeeker: match score for one posting against their confirmed resume
    [HttpGet("{id}/match")]
    [Authorize(Roles = "JobSeeker")]
    public async Task<IActionResult> MatchOne(int id)
    {
        var posting = await _db.JobPostings.FindAsync(id);
        if (posting == null || posting.Status != JobPostingStatus.Published)
            return NotFound();

        var resume = await _db.ResumeProfiles
            .Where(r => r.UserId == CurrentUserId && r.IsConfirmed)
            .OrderByDescending(r => r.UploadedAt)
            .FirstOrDefaultAsync();

        if (resume == null)
            return BadRequest("Upload and confirm a resume before checking matches.");

        var resumeSkills = JsonSerializer.Deserialize<List<string>>(resume.Skills) ?? new();
        var requiredSkills = JsonSerializer.Deserialize<List<string>>(posting.RequiredSkills) ?? new();

        var (percentage, matched, missing) = _matching.ComputeMatch(resumeSkills, requiredSkills);
        var suggestions = await _matching.GenerateSkillGapSuggestionsAsync(missing);

        return Ok(new
        {
            jobPostingId = posting.Id,
            title = posting.Title,
            matchPercentage = percentage,
            matchedSkills = matched,
            missingSkills = missing,
            learningSuggestions = suggestions
        });
    }

    // JobSeeker: match scores against ALL published postings, sorted highest first
    [HttpGet("~/api/matches")]
    [Authorize(Roles = "JobSeeker")]
    public async Task<IActionResult> MatchAll()
    {
        var resume = await _db.ResumeProfiles
            .Where(r => r.UserId == CurrentUserId && r.IsConfirmed)
            .OrderByDescending(r => r.UploadedAt)
            .FirstOrDefaultAsync();

        if (resume == null)
            return BadRequest("Upload and confirm a resume before checking matches.");

        var resumeSkills = JsonSerializer.Deserialize<List<string>>(resume.Skills) ?? new();

        var postings = await _db.JobPostings
            .Where(j => j.Status == JobPostingStatus.Published)
            .ToListAsync();

        var results = postings.Select(p =>
        {
            var requiredSkills = JsonSerializer.Deserialize<List<string>>(p.RequiredSkills) ?? new();
            var (percentage, matched, missing) = _matching.ComputeMatch(resumeSkills, requiredSkills);
            return new MatchResult(p.Id, p.Title, percentage, matched, missing);
        })
        .OrderByDescending(m => m.MatchPercentage)
        .ToList();

        return Ok(results);
    }
}