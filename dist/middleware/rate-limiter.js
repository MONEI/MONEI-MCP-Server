/**
 * Rate Limiter
 *
 * Simple sliding-window rate limiter per merchant account.
 * Prevents abuse of the MCP server by limiting tool calls.
 *
 * TODO: Replace with Redis-backed rate limiter for production.
 */
const store = new Map();
const DEFAULT_WINDOW_MS = 60_000; // 1 minute
const DEFAULT_MAX_REQUESTS = 30; // 30 requests per minute per account
export function checkRateLimit(accountId, config) {
    const windowMs = config?.windowMs ?? DEFAULT_WINDOW_MS;
    const maxRequests = config?.maxRequests ?? DEFAULT_MAX_REQUESTS;
    const now = Date.now();
    const windowStart = now - windowMs;
    // Get or create entry
    let entry = store.get(accountId);
    if (!entry) {
        entry = { timestamps: [] };
        store.set(accountId, entry);
    }
    // Prune old timestamps
    entry.timestamps = entry.timestamps.filter((t) => t > windowStart);
    // Check limit
    if (entry.timestamps.length >= maxRequests) {
        const oldestInWindow = entry.timestamps[0] ?? now;
        return {
            allowed: false,
            remaining: 0,
            resetAt: oldestInWindow + windowMs,
        };
    }
    // Record this request
    entry.timestamps.push(now);
    return {
        allowed: true,
        remaining: maxRequests - entry.timestamps.length,
        resetAt: now + windowMs,
    };
}
/**
 * Clear rate limit state for an account (useful for testing)
 */
export function resetRateLimit(accountId) {
    store.delete(accountId);
}
//# sourceMappingURL=rate-limiter.js.map