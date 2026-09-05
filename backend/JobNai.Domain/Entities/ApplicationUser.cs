using Microsoft.AspNetCore.Identity;

namespace JobNai.Domain.Entities;

public enum UserRole
{
    JobSeeker,
    Employer,
    Admin
}

public class ApplicationUser : IdentityUser
{
    public string FullName { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.JobSeeker;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}