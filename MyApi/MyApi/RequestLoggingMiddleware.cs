using Serilog;

public class RequestLoggingMiddleware
{
    private readonly RequestDelegate _next;

    public RequestLoggingMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task Invoke(HttpContext context)
    {
        Log.Information("Handling request: {Method} {Path}", context.Request.Method, context.Request.Path);
        
        await _next(context);

        Log.Information("Finished handling request.");
    }
}
