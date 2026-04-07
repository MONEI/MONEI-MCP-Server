/**
 * OAuth Session Manager Tests
 *
 * Verifies CSRF protection via single-use state tokens:
 * - Sessions are created with unique state
 * - Sessions can only be consumed once
 * - Expired sessions are rejected
 * - Invalid state values are rejected
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import {
  createOAuthSession,
  consumeOAuthSession,
  getActiveSessionCount,
} from "../../src/auth/session.js";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("OAuth Session Manager", () => {
  describe("createOAuthSession", () => {
    it("creates a session with a unique state", () => {
      const s1 = createOAuthSession();
      const s2 = createOAuthSession();
      expect(s1.state).not.toBe(s2.state);
    });

    it("includes PKCE code verifier and challenge", () => {
      const session = createOAuthSession();
      expect(session.codeVerifier.length).toBeGreaterThanOrEqual(43);
      expect(session.codeChallenge.length).toBeGreaterThan(0);
    });

    it("sets expiry in the future", () => {
      const session = createOAuthSession();
      expect(session.expiresAt).toBeGreaterThan(Date.now());
    });
  });

  describe("consumeOAuthSession", () => {
    it("returns the session for a valid state", () => {
      const created = createOAuthSession();
      const consumed = consumeOAuthSession(created.state);
      expect(consumed).not.toBeNull();
      expect(consumed!.state).toBe(created.state);
    });

    it("consumes the session — second use returns null", () => {
      const created = createOAuthSession();
      const first = consumeOAuthSession(created.state);
      const second = consumeOAuthSession(created.state);
      expect(first).not.toBeNull();
      expect(second).toBeNull();
    });

    it("returns null for an unknown state", () => {
      const result = consumeOAuthSession("totally_fake_state_value");
      expect(result).toBeNull();
    });

    it("returns null for an empty string", () => {
      const result = consumeOAuthSession("");
      expect(result).toBeNull();
    });

    it("returns null for an expired session", () => {
      // Mock Date.now to create a session, then advance past expiry
      const realNow = Date.now;
      const baseTime = realNow.call(Date);

      vi.spyOn(Date, "now").mockReturnValue(baseTime);
      const session = createOAuthSession();

      // Advance 11 minutes (past the 10-min TTL)
      vi.spyOn(Date, "now").mockReturnValue(baseTime + 11 * 60 * 1000);
      const consumed = consumeOAuthSession(session.state);
      expect(consumed).toBeNull();
    });
  });

  describe("getActiveSessionCount", () => {
    it("returns a count", () => {
      const count = getActiveSessionCount();
      expect(typeof count).toBe("number");
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });
});
