namespace JobNai.Application.DTOs;

public record AdminUserView(
    string Id,
    string FullName,
    string Email,
    string Role,
    bool IsLockedOut,
    DateTime CreatedAt
);

public record PlatformAnalytics(
    int TotalUsers,
    int TotalJobSeekers,
    int TotalEmployers,
    int TotalAdmins,
    int TotalJobPostings,
    int PublishedJobPostings,
    int DraftJobPostings,
    int ClosedJobPostings,
    int TotalResumesUploaded,
    int ConfirmedResumes,
    int TotalCoverLettersGenerated
);