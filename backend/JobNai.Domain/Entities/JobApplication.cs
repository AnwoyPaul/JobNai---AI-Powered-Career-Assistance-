namespace JobNai.Domain.Entities;

public enum ApplicationStatus
{
    Submitted,
    Reviewed,
    Accepted,
    Rejected
}

public class JobApplication
{
    public int Id { get; set; }

    public string JobSeekerId { get; set; } = string.Empty;
    public ApplicationUser JobSeeker { get; set; } = null!;

    public int JobPostingId { get; set; }
    public JobPosting JobPosting { get; set; } = null!;

    public int? CoverLetterId { get; set; }
    public CoverLetter? CoverLetter { get; set; }

    public ApplicationStatus Status { get; set; } = ApplicationStatus.Submitted;
    public DateTime AppliedAt { get; set; } = DateTime.UtcNow;
}