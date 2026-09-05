namespace JobNai.Application.DTOs;

public record CreateJobPostingRequest(string Title, string Description, List<string> RequiredSkills);
public record UpdateJobPostingRequest(string Title, string Description, List<string> RequiredSkills);

public record MatchResult(
    int JobPostingId,
    string Title,
    double MatchPercentage,
    List<string> MatchedSkills,
    List<string> MissingSkills
);