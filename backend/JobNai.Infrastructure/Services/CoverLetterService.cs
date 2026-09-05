using JobNai.Application.Services;
using System.Text;
using System.Text.Json;

namespace JobNai.Infrastructure.Services;

public class CoverLetterService : ICoverLetterService
{
    private readonly HttpClient _http;
    private const string Model = "llama3.2";

    public CoverLetterService(HttpClient http)
    {
        _http = http;
        _http.BaseAddress = new Uri("http://localhost:11434/");
    }

    private async Task<string> CallOllama(string prompt, double temperature = 0.4)
    {
        var requestBody = new
        {
            model = Model,
            prompt,
            stream = false,
            options = new { temperature }
        };

        var response = await _http.PostAsync(
            "api/generate",
            new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json")
        );

        response.EnsureSuccessStatusCode();
        var responseBody = await response.Content.ReadAsStringAsync();

        using var doc = JsonDocument.Parse(responseBody);
        return doc.RootElement.GetProperty("response").GetString()?.Trim() ?? "";
    }
public async Task<string> GenerateCoverLetterAsync(string resumeSummary, string jobTitle, string jobDescription)
{
    var prompt = $$"""
        Write a professional cover letter for a job application.

        CANDIDATE BACKGROUND:
        {{resumeSummary}}

        JOB TITLE: {{jobTitle}}

        JOB DESCRIPTION:
        {{jobDescription}}

        Write a concise, genuine-sounding cover letter (250-350 words). Use only the candidate background provided above — do not invent experience, companies, or skills not mentioned. Address it generically ("Dear Hiring Manager") since no company name was given. Output plain text only, no markdown formatting, no placeholders like [Your Name].
        """;

    var result = await CallOllama(prompt);
    return CleanPlaceholders(result);
}

public async Task<string> RegenerateCoverLetterAsync(string previousDraft, string editInstructions)
{
    var prompt = $$"""
        TASK: Revise the cover letter draft below according to the instruction, then output ONLY the revised letter — nothing else. Do not include any labels, markers, or symbols like <<< or >>> in your output.

        INSTRUCTION: {{editInstructions}}

        DRAFT TO REVISE:
        {{previousDraft}}
        """;

    var result = await CallOllama(prompt);
    return CleanPlaceholders(result.Replace("<<<", "").Replace(">>>", ""));
}

private static string CleanPlaceholders(string text)
{
    var placeholders = new[] { "[Your Name]", "[YOUR NAME]", "[Full Name]", "[Applicant Name]", "[Name]" };
    foreach (var p in placeholders)
    {
        text = text.Replace(p, "").Trim();
    }
    // Clean up a trailing "Sincerely," with nothing after it
    return text.TrimEnd().TrimEnd(',').Trim();
}
    public async Task<string> GenerateInterviewPrepAsync(string jobTitle, string jobDescription, List<string> missingSkills)
    {
        var missingSkillsText = missingSkills.Count > 0
            ? $"The candidate is missing these skills: {string.Join(", ", missingSkills)}."
            : "The candidate matches all required skills.";

        var prompt = $$"""
            Generate 5 realistic interview questions for a candidate applying to this role.

            JOB TITLE: {{jobTitle}}
            JOB DESCRIPTION: {{jobDescription}}
            {{missingSkillsText}}

            Mix technical and behavioral questions relevant to the role. If there are missing skills, include at least one question that probes the candidate's plan to address that gap.

            Output as a numbered plain-text list, one question per line, no markdown, no extra commentary.
            """;

        return await CallOllama(prompt, temperature: 0.5);
    }
}