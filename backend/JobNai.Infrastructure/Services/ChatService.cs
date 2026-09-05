using JobNai.Application.Services;
using System.Text;
using System.Text.Json;

namespace JobNai.Infrastructure.Services;

public class ChatService : IChatService
{
    private readonly HttpClient _http;
    private const string Model = "llama3.2";

    private const string SystemPrompt = """
        You are the JobNai help assistant. JobNai is an AI-powered job matching platform for Bangladeshi job seekers with these features:
        - Job Seekers: register/login, upload a PDF resume for AI extraction of skills/education/experience/projects, review and confirm the extracted data, see AI-computed match scores against published job postings with matched/missing skills, generate AI cover letters and interview prep questions, and apply to jobs.
        - Employers: register/login, create/edit job postings with required skills, publish or close postings, and view applicants with their status (Submitted, Reviewed, Accepted, Rejected).
        - Admins: manage users (suspend/unsuspend/delete) and job postings, view platform analytics.
        - The AI features run on a local model, so resume analysis and cover letter generation can take a few minutes to process.

        Only answer questions about how to use JobNai. Keep answers short (2-4 sentences), friendly, and practical. If asked something unrelated to the platform, politely redirect to platform topics.
        """;

    public ChatService(HttpClient http)
    {
        _http = http;
        _http.BaseAddress = new Uri("http://localhost:11434/");
    }

    public async Task<string> AskAsync(string message, List<(string role, string content)> history)
    {
        var messages = new List<object> { new { role = "system", content = SystemPrompt } };

        // Keep only the last few turns to stay fast on limited hardware
        foreach (var (role, content) in history.TakeLast(6))
        {
            messages.Add(new { role, content });
        }
        messages.Add(new { role = "user", content = message });

        var requestBody = new
        {
            model = Model,
            messages,
            stream = false,
            options = new { temperature = 0.3 }
        };

        var response = await _http.PostAsync(
            "api/chat",
            new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json")
        );

        response.EnsureSuccessStatusCode();
        var responseBody = await response.Content.ReadAsStringAsync();

        using var doc = JsonDocument.Parse(responseBody);
        return doc.RootElement.GetProperty("message").GetProperty("content").GetString()?.Trim() ?? "";
    }
}