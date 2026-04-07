/**
 * Rate Limiter Tests
 *
 * Verifies the sliding-window rate limiter:
 * - Allows requests within the limit
 * - Blocks requests that exceed the limit
 * - Resets after the window expires
 * - Tracks per-account independently
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import {
  checkRateLimit,
  resetRateLimit,
} from "../../src/middleware/rate-limiter.js";

afterEach(() => {
  resetRateLimit("test-account");
  resetRateLimit("account-a");
  resetRateLimit("account-b");
  vi.restoreAllMocks();
});

describe("Rate Limiter", () => {
  it("allows requests within the limit", () => {
    const result = checkRateLimit("test-account", { maxRequests: 5 });
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("blocks when limit is exceeded", () => {
    const config = { maxRequests: 3, windowMs: 60_000 };

    checkRateLimit("test-account", config); // 1
    checkRateLimit("test-account", config); // 2
    checkRateLimit("test-account", config); // 3

    const blocked = checkRateLimit("test-account", config);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it("tracks remaining correctly", () => {
    const config = { maxRequests: 5, windowMs: 60_000 };

    expect(checkRateLimit("test-account", config).remaining).toBe(4);
    expect(checkRateLimit("test-account", config).remaining).toBe(3);
    expect(checkRateLimit("test-account", config).remaining).toBe(2);
    expect(checkRateLimit("test-account", config).remaining).toBe(1);
    expect(checkRateLimit("test-account", config).remaining).toBe(0);
  });

  it("provides a reset timestamp", () => {
    const result = checkRateLimit("test-account");
    expect(result.resetAt).toBeGreaterThan(Date.now());
  });

  it("isolates accounts from each other", () => {
    const config = { maxRequests: 1, windowMs: 60_000 };

    checkRateLimit("account-a", config); // exhaust limit
    const blockedA = checkRateLimit("account-a", config);
    const allowedB = checkRateLimit("account-b", config);

    expect(blockedA.allowed).toBe(false);
    expect(allowedB.allowed).toBe(true);
  });

  it("allows requests again after window expires", () => {
    const config = { maxRequests: 1, windowMs: 1_000 };
    const realNow = Date.now;
    const baseTime = realNow.call(Date);

    vi.spyOn(Date, "now").mockReturnValue(baseTime);
    checkRateLimit("test-account", config);

    // Still blocked within window
    vi.spyOn(Date, "now").mockReturnValue(baseTime + 500);
    expect(checkRateLimit("test-account", config).allowed).toBe(false);

    // Allowed after window expires
    vi.spyOn(Date, "now").mockReturnValue(baseTime + 1_500);
    expect(checkRateLimit("test-account", config).allowed).toBe(true);
  });

  it("resetRateLimit clears the state", () => {
    const config = { maxRequests: 1, windowMs: 60_000 };
    checkRateLimit("test-account", config);
    expect(checkRateLimit("test-account", config).allowed).toBe(false);

    resetRateLimit("test-account");
    expect(checkRateLimit("test-account", config).allowed).toBe(true);
  });
});
