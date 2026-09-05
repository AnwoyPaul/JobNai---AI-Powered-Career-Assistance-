using JobNai.Application.DTOs;
using JobNai.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace JobNai.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ChatController : ControllerBase
{
    private readonly IChatService _chat;

    public ChatController(IChatService chat)
    {
        _chat = chat;
    }

    [HttpPost]
    public async Task<IActionResult> Ask(ChatRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Message))
            return BadRequest("Message cannot be empty.");

        var history = request.History.Select(h => (h.Role, h.Content)).ToList();
        var reply = await _chat.AskAsync(request.Message, history);

        return Ok(new { reply });
    }
}