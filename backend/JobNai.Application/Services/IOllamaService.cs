namespace JobNai.Application.Services;

public interface IOllamaService
{
    Task<string> ExtractResumeDataAsync(string resumeText);
}