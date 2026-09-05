using System.Text.Json;

namespace JobNai.Infrastructure.Services;

public static class ResumeJsonNormalizer
{
    public static string Normalize(string rawJson)
    {
        try
        {
            using var doc = JsonDocument.Parse(rawJson);
            var root = doc.RootElement;

            var skills = ExtractStringArray(root, "skills");
            var achievements = ExtractStringArray(root, "achievements");
            var education = ExtractObjectArray(root, "education", new[] { "degree", "institution", "year" });
            var experience = ExtractObjectArray(root, "experience", new[] { "title", "company", "duration" });
            var projects = ExtractObjectArray(root, "projects", new[] { "name", "description" });

            var result = new
            {
                skills,
                education,
                experience,
                projects,
                achievements
            };

            return JsonSerializer.Serialize(result);
        }
        catch
        {
            // If the AI output isn't even parseable JSON, return an empty-but-valid skeleton
            // so the frontend never crashes — the user can still fill everything in manually.
            return JsonSerializer.Serialize(new
            {
                skills = Array.Empty<string>(),
                education = Array.Empty<object>(),
                experience = Array.Empty<object>(),
                projects = Array.Empty<object>(),
                achievements = Array.Empty<string>()
            });
        }
    }

    private static List<string> ExtractStringArray(JsonElement root, string key)
    {
        var list = new List<string>();
        if (!root.TryGetProperty(key, out var el)) return list;

        if (el.ValueKind == JsonValueKind.Array)
        {
            foreach (var item in el.EnumerateArray())
            {
                if (item.ValueKind == JsonValueKind.String)
                {
                    var val = item.GetString();
                    if (!string.IsNullOrWhiteSpace(val)) list.Add(val.Trim());
                }
                else if (item.ValueKind == JsonValueKind.Object)
                {
                    // Model nested an object where a string was expected — flatten it into one readable line
                    var parts = item.EnumerateObject()
                        .Where(p => p.Value.ValueKind == JsonValueKind.String)
                        .Select(p => p.Value.GetString())
                        .Where(v => !string.IsNullOrWhiteSpace(v));
                    var joined = string.Join(" - ", parts);
                    if (!string.IsNullOrWhiteSpace(joined)) list.Add(joined);
                }
            }
        }
        else if (el.ValueKind == JsonValueKind.String)
        {
            // Model returned one big string instead of an array — split it on commas as a best-effort fallback
            var val = el.GetString() ?? "";
            list.AddRange(val.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries));
        }

        return list;
    }

    private static List<Dictionary<string, string>> ExtractObjectArray(JsonElement root, string key, string[] fields)
    {
        var list = new List<Dictionary<string, string>>();
        if (!root.TryGetProperty(key, out var el) || el.ValueKind != JsonValueKind.Array) return list;

        foreach (var item in el.EnumerateArray())
        {
            if (item.ValueKind != JsonValueKind.Object) continue;

            var entry = new Dictionary<string, string>();
            foreach (var field in fields)
            {
                // Case-insensitive lookup since models sometimes capitalize differently
                var match = item.EnumerateObject()
                    .FirstOrDefault(p => string.Equals(p.Name, field, StringComparison.OrdinalIgnoreCase));
                entry[field] = match.Value.ValueKind == JsonValueKind.String ? (match.Value.GetString() ?? "") : "";
            }
            list.Add(entry);
        }

        return list;
    }
}