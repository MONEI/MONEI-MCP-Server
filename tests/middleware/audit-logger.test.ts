/**
 * Audit Logger Tests
 *
 * Verifies that audit logging captures tool call context correctly.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { createAuditContext, logToolCall } from "../../src/middleware/audit-logger.js";

beforeEach(() => {
  vi.spyOn(console, "log").mockImplementation(() => {});
});

describe("Audit Logger", () => {
  describe("logToolCall", () => {
    it("logs to stdout as structured JSON", () => {
      logToolCall({
        timestamp: "2026-04-07T12:00:00.000Z",
        accountId: "acct_123",
        toolName: "get_payment",
        params: { paymentId: "pay_abc" },
        success: true,
        durationMs: 42,
      });

      expect(console.log).toHaveBeenCalledOnce();
      const logged = JSON.parse(
        (console.log as ReturnType<typeof vi.fn>).mock.calls[0][0]
      );
      expect(logged.level).toBe("info");
      expect(logged.event).toBe("tool_call");
      expect(logged.accountId).toBe("acct_123");
      expect(logged.toolName).toBe("get_payment");
      expect(logged.success).toBe(true);
    });

    it("logs errors with error level", () => {
      logToolCall({
        timestamp: "2026-04-07T12:00:00.000Z",
        accountId: "acct_123",
        toolName: "get_payment",
        params: {},
        success: false,
        error: "Not found",
        durationMs: 10,
      });

      const logged = JSON.parse(
        (console.log as ReturnType<typeof vi.fn>).mock.calls[0][0]
      );
      expect(logged.level).toBe("error");
      expect(logged.error).toBe("Not found");
    });
  });

  describe("createAuditContext", () => {
    it("tracks duration for successful calls", async () => {
      const audit = createAuditContext("acct_456", "list_payments");

      // Simulate some work
      await new Promise((r) => setTimeout(r, 10));
      audit.success({ limit: 10 });

      const logged = JSON.parse(
        (console.log as ReturnType<typeof vi.fn>).mock.calls[0][0]
      );
      expect(logged.accountId).toBe("acct_456");
      expect(logged.toolName).toBe("list_payments");
      expect(logged.success).toBe(true);
      expect(logged.durationMs).toBeGreaterThanOrEqual(0);
    });

    it("captures error details for failed calls", () => {
      const audit = createAuditContext("acct_789", "generate_payment_link");
      audit.failure({ amount: 100 }, "Invalid amount");

      const logged = JSON.parse(
        (console.log as ReturnType<typeof vi.fn>).mock.calls[0][0]
      );
      expect(logged.success).toBe(false);
      expect(logged.error).toBe("Invalid amount");
    });
  });
});
