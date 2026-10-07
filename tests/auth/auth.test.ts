import { describe, it, expect } from "vitest";
import { generateCodeVerifier, generateCodeChallenge, generateState } from "../../src/auth/pkce.js";
import { createState, validateAndConsumeState } from "../../src/auth/session.js";

describe("PKCE", () => {
  it("generates verifier of valid length (43-128)", () => {
    const v = generateCodeVerifier();
    expect(v.length).toBeGreaterThanOrEqual(43);
    expect(v.length).toBeLessThanOrEqual(128);
  });

  it("generates unique verifiers", () => {
    expect(generateCodeVerifier()).not.toBe(generateCodeVerifier());
  });

  it("generates challenge from verifier (not equal to verifier)", () => {
    const v = generateCodeVerifier();
    const c = generateCodeChallenge(v);
    expect(c).toBeTruthy();
    expect(c).not.toBe(v);
  });

  it("same verifier → same challenge (deterministic)", () => {
    const v = generateCodeVerifier();
    expect(generateCodeChallenge(v)).toBe(generateCodeChallenge(v));
  });

  it("generates unique states", () => {
    expect(generateState()).not.toBe(generateState());
  });
});

describe("Session State (CSRF)", () => {
  it("validates a freshly created state", () => {
    const s = "state_" + Date.now();
    createState(s);
    expect(validateAndConsumeState(s)).toBe(true);
  });

  it("rejects consumed state (single-use)", () => {
    const s = "single_" + Date.now();
    createState(s);
    expect(validateAndConsumeState(s)).toBe(true);
    expect(validateAndConsumeState(s)).toBe(false);
  });

  it("rejects unknown state", () => {
    expect(validateAndConsumeState("unknown_state_xyz")).toBe(false);
  });
});
