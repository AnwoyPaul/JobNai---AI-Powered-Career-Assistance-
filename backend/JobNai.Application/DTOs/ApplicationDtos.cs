namespace JobNai.Application.DTOs;

public record ApplyRequest(int JobPostingId, int? CoverLetterId);
public record UpdateApplicationStatusRequest(string Status);                     