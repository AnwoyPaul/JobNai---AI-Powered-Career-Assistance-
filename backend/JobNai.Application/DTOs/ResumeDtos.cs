namespace JobNai.Application.DTOs;

public record ExtractedResumeData(
    List<string> Skills,
    List<Dictionary<string, string>> Education,
    List<Dictionary<string, string>> Experience,
    List<Dictionary<string, string>> Projects,
    List<string> Achievements
);

public record ConfirmResumeRequest(
    List<string> Skills,
    List<Dictionary<string, string>> Education,
    List<Dictionary<string, string>> Experience,
    List<Dictionary<string, string>> Projects,
    List<string> Achievements
);