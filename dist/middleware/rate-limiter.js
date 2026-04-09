const store = new Map();
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 60;
export function checkRateLimit(accountId) {
    const now = Date.now();
    let entry = store.get(accountId);
    if (!entry) {
        entry = { timestamps: [] };
        store.set(accountId, entry);
    }
    entry.timestamps = entry.timestamps.filter(ts => now - ts < WINDOW_MS);
    if (entry.timestamps.length >= MAX_REQUESTS) {
        return { allowed: false, remaining: 0, resetMs: WINDOW_MS - (now - entry.timestamps[0]) };
    }
    entry.timestamps.push(now);
    return { allowed: true, remaining: MAX_REQUESTS - entry.timestamps.length, resetMs: 0 };
}
//# sourceMappingURL=rate-limiter.js.map