namespace JobNai.Domain.Entities;

public enum JobPostingStatus
{
    Draft,
    Published,
    Closed
}

public class JobPosting
{
    public int Id { get; set; }

    public string EmployerId { get; set; } = string.Empty;
    public ApplicationUser Employer { get; set; } = null!;

    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string RequiredSkills { get; set; } = "[]"; // JSON array of strings

    public JobPostingStatus Status { get; set; } = JobPostingStatus.Draft;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? PublishedAt { get; set; }
}