namespace JobNai.Application.Services;

public interface IChatService
{
    Task<string> AskAsync(string message, List<(string role, string content)> history);
}