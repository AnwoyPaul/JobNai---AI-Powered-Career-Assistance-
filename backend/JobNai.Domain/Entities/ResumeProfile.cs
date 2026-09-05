namespace JobNai.Domain.Entities;

public class ResumeProfile
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public ApplicationUser User { get; set; } = null!;

    public string OriginalFileName { get; set; } = string.Empty;
    public string StoredFilePath { get; set; } = string.Empty;

    // Raw AI output before user edits, kept for audit/debug
    public string RawExtractedJson { get; set; } = string.Empty;

    // Confirmed/edited fields, stored as JSON arrays for simplicity
    public string Skills { get; set; } = "[]";
    public string Education { get; set; } = "[]";
    public string Experience { get; set; } = "[]";
    public string Projects { get; set; } = "[]";
    public string Achievements { get; set; } = "[]";
    public bool IsConfirmed { get; set; } = false;
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
}