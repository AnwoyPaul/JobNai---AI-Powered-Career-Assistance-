using JobNai.Application.DTOs;
using JobNai.Application.Services;
using JobNai.Domain.Entities;
using JobNai.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json;
using UglyToad.PdfPig;
using JobNai.Infrastructure.Services;
namespace JobNai.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ResumesController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IOllamaService _ollama;
    private readonly IWebHostEnvironment _env;

    public ResumesController(AppDbContext db, IOllamaService ollama, IWebHostEnvironment env)
    {
        _db = db;
        _ollama = ollama;
        _env = env;
    }

    private string CurrentUserId => User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? User.FindFirstValue("sub")!;

    [HttpPost("upload")]
    [RequestSizeLimit(10_000_000)] // 10MB
    public async Task<IActionResult> Upload(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file uploaded.");

        if (Path.GetExtension(file.FileName).ToLower() != ".pdf")
            return BadRequest("Only PDF files are accepted.");

        // Save file
        var uploadsDir = Path.Combine(_env.ContentRootPath, "wwwroot", "uploads");
        Directory.CreateDirectory(uploadsDir);
        var storedFileName = $"{Guid.NewGuid()}.pdf";
        var storedPath = Path.Combine(uploadsDir, storedFileName);

        using (var stream = new FileStream(storedPath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        // Extract text
        string resumeText;
        try
        {
            using var pdf = PdfDocument.Open(storedPath);
            resumeText = string.Join("\n", pdf.GetPages().Select(p => p.Text));
        }
        catch
        {
            System.IO.File.Delete(storedPath);
            return BadRequest("Invalid or unreadable PDF.");
        }

        if (string.IsNullOrWhiteSpace(resumeText))
            return BadRequest("Could not extract any text from this PDF (it may be a scanned image).");

        // AI extraction
        string rawJson;
        try
        {
           var aiOutput = await _ollama.ExtractResumeDataAsync(resumeText);
rawJson = ResumeJsonNormalizer.Normalize(aiOutput);
        }
        catch (Exception ex)
        {
            return StatusCode(502, $"AI extraction failed. Is Ollama running? ({ex.Message})");
        }

        var profile = new ResumeProfile
        {
            UserId = CurrentUserId,
            OriginalFileName = file.FileName,
            StoredFilePath = storedPath,
            RawExtractedJson = rawJson,
            IsConfirmed = false
        };

        _db.ResumeProfiles.Add(profile);
        await _db.SaveChangesAsync();

        return Ok(new { profileId = profile.Id, extracted = JsonSerializer.Deserialize<JsonElement>(rawJson) });
    }

    [HttpPost("{id}/confirm")]
    public async Task<IActionResult> Confirm(int id, ConfirmResumeRequest request)
    {
        var profile = await _db.ResumeProfiles
            .FirstOrDefaultAsync(r => r.Id == id && r.UserId == CurrentUserId);

        if (profile == null) return NotFound();

        profile.Skills = JsonSerializer.Serialize(request.Skills);
        profile.Education = JsonSerializer.Serialize(request.Education);
        profile.Experience = JsonSerializer.Serialize(request.Experience);
        profile.Projects = JsonSerializer.Serialize(request.Projects);
        profile.Achievements = JsonSerializer.Serialize(request.Achievements);
        profile.IsConfirmed = true;

        await _db.SaveChangesAsync();
        return Ok(profile);
    }

    [HttpGet("mine")]
    public async Task<IActionResult> GetMine()
    {
        var profile = await _db.ResumeProfiles
            .Where(r => r.UserId == CurrentUserId)
            .OrderByDescending(r => r.UploadedAt)
            .FirstOrDefaultAsync();

        if (profile == null) return NotFound();
        return Ok(profile);
    }
}