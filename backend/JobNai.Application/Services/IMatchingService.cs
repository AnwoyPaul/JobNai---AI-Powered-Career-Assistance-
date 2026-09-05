namespace JobNai.Application.Services;

public interface IMatchingService
{
    (double percentage, List<string> matched, List<string> missing) ComputeMatch(
        List<string> resumeSkills, List<string> requiredSkills);

    Task<string> GenerateSkillGapSuggestionsAsync(List<string> missingSkills);
}