using JobNai.Application.DTOs;
using JobNai.Domain.Entities;
using JobNai.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace JobNai.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly UserManager<ApplicationUser> _userManager;

    public AdminController(AppDbContext db, UserManager<ApplicationUser> userManager)
    {
        _db = db;
        _userManager = userManager;
    }

    // List all users on the platform
    [HttpGet("users")]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _db.Users.OrderByDescending(u => u.CreatedAt).ToListAsync();

        var result = users.Select(u => new AdminUserView(
            u.Id,
            u.FullName,
            u.Email ?? "",
            u.Role.ToString(),
            u.LockoutEnd != null && u.LockoutEnd > DateTimeOffset.UtcNow,
            u.CreatedAt
        ));

        return Ok(result);
    }

    // Suspend a user (lock them out indefinitely)
    [HttpPost("users/{id}/suspend")]
    public async Task<IActionResult> SuspendUser(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null) return NotFound();

        await _userManager.SetLockoutEnabledAsync(user, true);
        await _userManager.SetLockoutEndDateAsync(user, DateTimeOffset.MaxValue);

        return Ok();
    }

    // Reinstate a suspended user
    [HttpPost("users/{id}/unsuspend")]
    public async Task<IActionResult> UnsuspendUser(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null) return NotFound();

        await _userManager.SetLockoutEndDateAsync(user, null);

        return Ok();
    }

    // Permanently delete a user
    [HttpDelete("users/{id}")]
    public async Task<IActionResult> DeleteUser(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null) return NotFound();

        // Safety: prevent an admin from deleting their own account by accident
        var currentAdminId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (user.Id == currentAdminId)
            return BadRequest("You cannot delete your own account while logged in as it.");

        var result = await _userManager.DeleteAsync(user);
        if (!result.Succeeded)
            return BadRequest(result.Errors.Select(e => e.Description));

        return Ok();
    }

    // Platform-wide analytics
    [HttpGet("analytics")]
    public async Task<IActionResult> GetAnalytics()
    {
        var users = await _db.Users.ToListAsync();
        var postings = await _db.JobPostings.ToListAsync();
        var resumes = await _db.ResumeProfiles.ToListAsync();
        var coverLetters = await _db.CoverLetters.CountAsync();

        var analytics = new PlatformAnalytics(
            TotalUsers: users.Count,
            TotalJobSeekers: users.Count(u => u.Role == UserRole.JobSeeker),
            TotalEmployers: users.Count(u => u.Role == UserRole.Employer),
            TotalAdmins: users.Count(u => u.Role == UserRole.Admin),
            TotalJobPostings: postings.Count,
            PublishedJobPostings: postings.Count(p => p.Status == JobPostingStatus.Published),
            DraftJobPostings: postings.Count(p => p.Status == JobPostingStatus.Draft),
            ClosedJobPostings: postings.Count(p => p.Status == JobPostingStatus.Closed),
            TotalResumesUploaded: resumes.Count,
            ConfirmedResumes: resumes.Count(r => r.IsConfirmed),
            TotalCoverLettersGenerated: coverLetters
        );

        return Ok(analytics);
    }
}