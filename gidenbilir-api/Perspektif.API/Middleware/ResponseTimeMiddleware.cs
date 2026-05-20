using System.Diagnostics;

namespace Perspektif.API.Middleware;

public class ResponseTimeMiddleware(RequestDelegate next, ILogger<ResponseTimeMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        var sw = Stopwatch.StartNew();
        await next(context);
        sw.Stop();

        var ms = sw.ElapsedMilliseconds;
        var method = context.Request.Method;
        var path = context.Request.Path;
        var status = context.Response.StatusCode;

        if (ms > 500)
            logger.LogWarning("SLOW {Method} {Path} → {Status} ({Ms}ms)", method, path, status, ms);
        else if (ms > 200)
            logger.LogInformation("WARN {Method} {Path} → {Status} ({Ms}ms)", method, path, status, ms);
        else
            logger.LogDebug("OK   {Method} {Path} → {Status} ({Ms}ms)", method, path, status, ms);
    }
}
