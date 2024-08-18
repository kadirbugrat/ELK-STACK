using Microsoft.AspNetCore.Mvc;
using Serilog;
using MongoDB.Driver;
using System.Threading.Tasks;
using System.Collections.Generic;
using MongoDB.Bson;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly MongoService _mongoService;

    public UsersController(MongoService mongoService)
    {
        _mongoService = mongoService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<User>>> GetUsers()
    {
        var users = await _mongoService.Users.Find(_ => true).ToListAsync();
        Log.Information("Fetched all users cdfvdsdfgfds");
        return Ok(users);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<User>> GetUser(string id)
    {
        if (!ObjectId.TryParse(id, out var objectId))
        {
            Log.Warning("Invalid ID format: {Id}", id);
            return BadRequest("Invalid ID format");
        }

        var user = await _mongoService.Users.Find(u => u.Id == id).FirstOrDefaultAsync();
        if (user == null)
        {
            Log.Warning("User with ID {Id} not found", id);
            return NotFound();
        }
        Log.Information("Fetched user with ID {Id} calıyoooooooooooooooo", id);
        return Ok(user);
    }

    [HttpPost]
    public async Task<ActionResult<User>> CreateUser(User user)
    {
        if (string.IsNullOrEmpty(user.Id))
        {
            user.Id = ObjectId.GenerateNewId().ToString(); // Yeni bir ObjectId oluşturulur
        }

        await _mongoService.Users.InsertOneAsync(user);
        Log.Information("Created user with ID {Id}", user.Id);
        return CreatedAtAction(nameof(GetUser), new { id = user.Id }, user);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(string id)
    {
        if (!ObjectId.TryParse(id, out var objectId))
        {
            Log.Warning("Invalid ID format: {Id}", id);
            return BadRequest("Invalid ID format");
        }

        var result = await _mongoService.Users.DeleteOneAsync(u => u.Id == id);
        if (result.DeletedCount == 0)
        {
            Log.Warning("User with ID {Id} not found", id);
            return NotFound();
        }
        Log.Information("Deleted user with ID {Id}", id);
        return NoContent();
    }
}
