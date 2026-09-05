using JobNai.Application.Services;
using System.Text;
using System.Text.Json;

namespace JobNai.Infrastructure.Services;

public class OllamaService : IOllamaService
{
    private readonly HttpClient _http;
    private const string Model = "llama3.2";

    public OllamaService(HttpClient http)
    {
        _http = http;
        _http.BaseAddress = new Uri("http://localhost:11434/");
    }

    public async Task<string> ExtractResumeDataAsync(string resumeText)
    {
        var prompt = $$"""
    RESUME TEXT:
    <
    {{resumeText}}
    >>>

    Read the resume text above carefully. Extract ONLY information that actually appears in it. Do not invent, guess, or use placeholder data.

    Output valid JSON with exactly these keys:
    - "skills": array of skill name strings found in the resume
    - "education": array of objects, each with "degree", "institution", "year" — using text found in the resume
    - "experience": array of objects, each with "title", "company", "duration" — using text found in the resume
    - "projects": array of objects, each with "name" and "description". The "description" must be 1-2 sentences summarizing what the project actually does or what problem it solves, written in your own words based on the project's bullet points. NEVER put a link label, URL, "GitHub", "Live Demo", or any other link/reference text as the description — skip those and use the real explanatory text instead.
    - "achievements": array of short strings (contest results, ratings, awards, certifications) found in the resume

    If a section has nothing in the resume, output an empty array [] for that key — do not fill it with example or placeholder text.

    Output ONLY the JSON object, nothing else.
    """;
        var requestBody = new
        {
            model = Model,
            prompt,
            stream = false,
            format = "json",
            options = new { temperature = 0.1 }
        };

        var response = await _http.PostAsync(
            "api/generate",
            new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json")
        );

        response.EnsureSuccessStatusCode();
        var responseBody = await response.Content.ReadAsStringAsync();

        using var doc = JsonDocument.Parse(responseBody);
        return doc.RootElement.GetProperty("response").GetString() ?? "{}";
    }
}