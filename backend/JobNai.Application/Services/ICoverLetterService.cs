namespace JobNai.Application.Services;

public interface ICoverLetterService
{
    Task<string> GenerateCoverLetterAsync(string resumeSummary, string jobTitle, string jobDescription);
    Task<string> RegenerateCoverLetterAsync(string previousDraft, string editInstructions);
    Task<string> GenerateInterviewPrepAsync(string jobTitle, string jobDescription, List<string> missingSkills);
}