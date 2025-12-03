using System.ComponentModel.DataAnnotations;

namespace server.Models;

public class TodoItem
{
    public string id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public bool IsCompleted { get; set; }

    public DateTime createdAt { get; set; } = DateTime.UtcNow;
}
