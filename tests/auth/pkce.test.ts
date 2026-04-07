/**
 * PKCE Tests
 *
 * Verifies RFC 7636 implementation:
 * - Code verifier generation (randomness, length)
 * - Code challenge derivation (S256)
 * - Challenge verification (correct + incorrect)
 */

import { describe, it, expect } from "vitest";
import {
  generateCodeVerifier,
  generateCodeChallenge,
  verifyCodeChallenge,
} from "../../src/auth/pkce.js";

describe("PKCE", () => {
  describe("generateCodeVerifier", () => {
    it("produces a string of at least 43 characters", () => {
      const verifier = generateCodeVerifier();
      expect(verifier.length).toBeGreaterThanOrEqual(43);
    });

    it("produces a string of at most 128 characters", () => {
      const verifier = generateCodeVerifier(128);
      expect(verifier.length).toBeLessThanOrEqual(128);
    });

    it("uses only URL-safe base64 characters", () => {
      const verifier = generateCodeVerifier();
      expect(verifier).toMatch(/^[A-Za-z0-9_-]+$/);
    });

    it("generates unique verifiers", () => {
      const v1 = generateCodeVerifier();
      const v2 = generateCodeVerifier();
      expect(v1).not.toBe(v2);
    });
  });

  describe("generateCodeChallenge", () => {
    it("produces a non-empty string", () => {
      const verifier = generateCodeVerifier();
      const challenge = generateCodeChallenge(verifier);
      expect(challenge.length).toBeGreaterThan(0);
    });

    it("is deterministic for the same verifier", () => {
      const verifier = "test_verifier_12345678901234567890123456789012";
      const c1 = generateCodeChallenge(verifier);
      const c2 = generateCodeChallenge(verifier);
      expect(c1).toBe(c2);
    });

    it("produces different challenges for different verifiers", () => {
      const c1 = generateCodeChallenge(generateCodeVerifier());
      const c2 = generateCodeChallenge(generateCodeVerifier());
      expect(c1).not.toBe(c2);
    });

    it("uses URL-safe base64 encoding (no padding)", () => {
      const verifier = generateCodeVerifier();
      const challenge = generateCodeChallenge(verifier);
      expect(challenge).toMatch(/^[A-Za-z0-9_-]+$/);
      expect(challenge).not.toContain("=");
    });
  });

  describe("verifyCodeChallenge", () => {
    it("returns true for matching verifier + challenge", () => {
      const verifier = generateCodeVerifier();
      const challenge = generateCodeChallenge(verifier);
      expect(verifyCodeChallenge(verifier, challenge)).toBe(true);
    });

    it("returns false for wrong verifier", () => {
      const verifier = generateCodeVerifier();
      const challenge = generateCodeChallenge(verifier);
      const wrongVerifier = generateCodeVerifier();
      expect(verifyCodeChallenge(wrongVerifier, challenge)).toBe(false);
    });

    it("returns false for tampered challenge", () => {
      const verifier = generateCodeVerifier();
      const challenge = generateCodeChallenge(verifier);
      const tampered = challenge.slice(0, -1) + "X";
      expect(verifyCodeChallenge(verifier, tampered)).toBe(false);
    });

    it("returns false for empty strings", () => {
      expect(verifyCodeChallenge("", "")).toBe(false);
    });
  });
});
