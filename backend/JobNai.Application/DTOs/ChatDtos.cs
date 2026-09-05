namespace JobNai.Application.DTOs;

public record ChatMessageDto(string Role, string Content); // Role: "user" or "assistant"
public record ChatRequest(string Message, List<ChatMessageDto> History);