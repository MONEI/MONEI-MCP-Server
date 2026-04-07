/**
 * OAuth Scope Validation Tests
 *
 * Ensures the server only accepts scopes within the allowed set,
 * preventing scope escalation attacks.
 */

import { describe, it, expect } from "vitest";
import { validateScopes, ALLOWED_SCOPES } from "../../src/auth/oauth.js";

describe("OAuth Scope Validation", () => {
  it("accepts all allowed scopes individually", () => {
    for (const scope of ALLOWED_SCOPES) {
      expect(validateScopes([scope])).toBe(true);
    }
  });

  it("accepts the full set of allowed scopes", () => {
    expect(validateScopes([...ALLOWED_SCOPES])).toBe(true);
  });

  it("rejects scopes outside the allowed set", () => {
    expect(validateScopes(["payments:refund"])).toBe(false);
    expect(validateScopes(["admin:write"])).toBe(false);
    expect(validateScopes(["payments:delete"])).toBe(false);
    expect(validateScopes(["*"])).toBe(false);
  });

  it("rejects when ANY scope is invalid (mixed valid + invalid)", () => {
    expect(
      validateScopes(["payments:read", "payments:refund"])
    ).toBe(false);
  });

  it("accepts empty scope array", () => {
    expect(validateScopes([])).toBe(true);
  });

  it("only allows 4 specific scopes", () => {
    expect(ALLOWED_SCOPES).toHaveLength(4);
    expect(ALLOWED_SCOPES).toContain("payments:read");
    expect(ALLOWED_SCOPES).toContain("payments:create");
    expect(ALLOWED_SCOPES).toContain("subscriptions:read");
    expect(ALLOWED_SCOPES).toContain("account:read");
  });

  it("does NOT allow write scopes for subscriptions", () => {
    expect(validateScopes(["subscriptions:write"])).toBe(false);
    expect(validateScopes(["subscriptions:cancel"])).toBe(false);
    expect(validateScopes(["subscriptions:delete"])).toBe(false);
  });

  it("does NOT allow account write scope", () => {
    expect(validateScopes(["account:write"])).toBe(false);
    expect(validateScopes(["account:admin"])).toBe(false);
  });
});
