namespace JobNai.Application.DTOs;

public record GenerateCoverLetterRequest(int JobPostingId);
public record RegenerateCoverLetterRequest(string EditInstructions);