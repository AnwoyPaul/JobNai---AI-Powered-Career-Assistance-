using JobNai.Application.Services;
using System.Text;
using System.Text.Json;

namespace JobNai.Infrastructure.Services;

public class MatchingService : IMatchingService
{
    private readonly HttpClient _http;
    private const string Model = "llama3.2";

    public MatchingService(HttpClient http)
    {
        _http = http;
        _http.BaseAddress = new Uri("http://localhost:11434/");
    }

    public (double percentage, List<string> matched, List<string> missing) ComputeMatch(
        List<string> resumeSkills, List<string> requiredSkills)
    {
        if (requiredSkills == null || requiredSkills.Count == 0)
            return (0, new List<string>(), new List<string>());

        var normalizedResume = resumeSkills
            .Select(s => s.Trim().ToLowerInvariant())
            .ToHashSet();

        var matched = new List<string>();
        var missing = new List<string>();

        foreach (var required in requiredSkills)
        {
            var normalizedRequired = required.Trim().ToLowerInvariant();
            if (normalizedResume.Contains(normalizedRequired))
                matched.Add(required);
            else
                missing.Add(required);
        }

        var percentage = Math.Round((double)matched.Count / requiredSkills.Count * 100, 1);
        return (percentage, matched, missing);
    }

    public async Task<string> GenerateSkillGapSuggestionsAsync(List<string> missingSkills)
    {
        if (missingSkills.Count == 0) return "";

        var prompt = $$"""
            A job seeker is missing these skills for a job they want: {{string.Join(", ", missingSkills)}}.

            For each missing skill, suggest ONE short, practical way to learn it (a type of resource, not a specific paid course name).
            Keep the whole response under 80 words total. Output plain text, no markdown, no headers.
            """;

        var requestBody = new
        {
            model = Model,
            prompt,
            stream = false,
            options = new { temperature = 0.3 }
        };

        try
        {
            var response = await _http.PostAsync(
                "api/generate",
                new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json")
            );
            response.EnsureSuccessStatusCode();
            var responseBody = await response.Content.ReadAsStringAsync();

            using var doc = JsonDocument.Parse(responseBody);
            return doc.RootElement.GetProperty("response").GetString()?.Trim() ?? "";
        }
        catch
        {
            return ""; // suggestions are a nice-to-have; never fail the match itself over this
        }
    }
}