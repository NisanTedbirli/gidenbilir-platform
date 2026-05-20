using Microsoft.Extensions.Caching.Memory;

namespace Perspektif.API.Services;

public class CacheService(IMemoryCache cache)
{
    public bool TryGet<T>(string key, out T? value) => cache.TryGetValue(key, out value);

    public void Set<T>(string key, T value, TimeSpan? expiry = null) =>
        cache.Set(key, value, expiry ?? TimeSpan.FromMinutes(3));

    public void Remove(string key) => cache.Remove(key);

    public void RemoveByPrefix(string prefix)
    {
        // IMemoryCache doesn't support prefix removal natively.
        // Callers should use a version/tag key to invalidate groups instead.
    }
}
