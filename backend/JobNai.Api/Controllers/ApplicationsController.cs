using JobNai.Application.DTOs;
using JobNai.Domain.Entities;
using JobNai.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace JobNai.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ApplicationsController : ControllerBase
{
    private readonly AppDbContext _db;

    public ApplicationsController(AppDbContext db)
    {
        _db = db;
    }

    private string CurrentUserId => User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? User.FindFirstValue("sub")!;

    // JobSeeker: apply to a job posting
    [HttpPost]
    [Authorize(Roles = "JobSeeker")]
    public async Task<IActionResult> Apply(ApplyRequest request)
    {
        var posting = await _db.JobPostings.FindAsync(request.JobPostingId);
        if (posting == null || posting.Status != JobPostingStatus.Published)
            return NotFound("This job posting is not available.");

        var resume = await _db.ResumeProfiles
            .Where(r => r.UserId == CurrentUserId && r.IsConfirmed)
            .OrderByDescending(r => r.UploadedAt)
            .FirstOrDefaultAsync();

        if (resume == null)
            return BadRequest("Upload and confirm a resume before applying.");

        var alreadyApplied = await _db.JobApplications
            .AnyAsync(a => a.JobSeekerId == CurrentUserId && a.JobPostingId == request.JobPostingId);

        if (alreadyApplied)
            return BadRequest("You have already applied to this job.");

        if (request.CoverLetterId.HasValue)
        {
            var ownsLetter = await _db.CoverLetters
                .AnyAsync(c => c.Id == request.CoverLetterId && c.UserId == CurrentUserId);
            if (!ownsLetter)
                return BadRequest("Invalid cover letter.");
        }

        var application = new JobApplication
        {
            JobSeekerId = CurrentUserId,
            JobPostingId = request.JobPostingId,
            CoverLetterId = request.CoverLetterId
        };

        _db.JobApplications.Add(application);
        await _db.SaveChangesAsync();

        return Ok(application);
    }

    // JobSeeker: my applications
    [HttpGet("mine")]
    [Authorize(Roles = "JobSeeker")]
    public async Task<IActionResult> GetMine()
    {
        var applications = await _db.JobApplications
            .Include(a => a.JobPosting)
            .Where(a => a.JobSeekerId == CurrentUserId)
            .OrderByDescending(a => a.AppliedAt)
            .ToListAsync();

        return Ok(applications);
    }

    // JobSeeker: check if already applied to a specific posting
    [HttpGet("check/{jobPostingId}")]
    [Authorize(Roles = "JobSeeker")]
    public async Task<IActionResult> CheckApplied(int jobPostingId)
    {
        var applied = await _db.JobApplications
            .AnyAsync(a => a.JobSeekerId == CurrentUserId && a.JobPostingId == jobPostingId);

        return Ok(new { applied });
    }

    // Employer: view applicants for one of their own postings
    [HttpGet("job/{jobPostingId}")]
    [Authorize(Roles = "Employer")]
    public async Task<IActionResult> GetApplicantsForJob(int jobPostingId)
    {
        var posting = await _db.JobPostings
            .FirstOrDefaultAsync(p => p.Id == jobPostingId && p.EmployerId == CurrentUserId);

        if (posting == null) return NotFound();

        var applications = await _db.JobApplications
            .Include(a => a.JobSeeker)
            .Include(a => a.CoverLetter)
            .Where(a => a.JobPostingId == jobPostingId)
            .OrderByDescending(a => a.AppliedAt)
            .ToListAsync();

        var result = applications.Select(a => new
        {
            a.Id,
            a.Status,
            a.AppliedAt,
            ApplicantName = a.JobSeeker.FullName,
            ApplicantEmail = a.JobSeeker.Email,
            CoverLetterContent = a.CoverLetter?.Content
        });

        return Ok(result);
    }

    // Employer: update an applicant's status
    [HttpPost("{id}/status")]
    [Authorize(Roles = "Employer")]
    public async Task<IActionResult> UpdateStatus(int id, UpdateApplicationStatusRequest request)
    {
        var application = await _db.JobApplications
            .Include(a => a.JobPosting)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (application == null) return NotFound();
        if (application.JobPosting.EmployerId != CurrentUserId) return Forbid();

        if (!Enum.TryParse<ApplicationStatus>(request.Status, true, out var status))
            return BadRequest("Invalid status. Use Submitted, Reviewed, Accepted, or Rejected.");

        application.Status = status;
        await _db.SaveChangesAsync();

        return Ok(application);
    }
}