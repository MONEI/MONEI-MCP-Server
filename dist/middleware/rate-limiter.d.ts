/**
 * Rate Limiter
 *
 * Simple sliding-window rate limiter per merchant account.
 * Prevents abuse of the MCP server by limiting tool calls.
 *
 * TODO: Replace with Redis-backed rate limiter for production.
 */
export interface RateLimitConfig {
    windowMs?: number;
    maxRequests?: number;
}
export declare function checkRateLimit(accountId: string, config?: RateLimitConfig): {
    allowed: boolean;
    remaining: number;
    resetAt: number;
};
/**
 * Clear rate limit state for an account (useful for testing)
 */
export declare function resetRateLimit(accountId: string): void;
//# sourceMappingURL=rate-limiter.d.ts.map