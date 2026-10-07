import { describe, it, expect, vi } from "vitest";
import { checkRateLimit } from "../../src/middleware/rate-limiter.js";
import { logToolCall, getRecentAuditEntries, withAudit } from "../../src/middleware/audit-logger.js";

describe("Rate Limiter", () => {
  it("allows requests under the limit", () => {
    const id = "rl_" + Date.now();
    const r = checkRateLimit(id);
    expect(r.allowed).toBe(true);
    expect(r.remaining).toBeGreaterThan(0);
  });

  it("decrements remaining on each call", () => {
    const id = "rl_dec_" + Date.now();
    const r1 = checkRateLimit(id);
    const r2 = checkRateLimit(id);
    expect(r2.remaining).toBe(r1.remaining - 1);
  });
});

describe("Audit Logger", () => {
  it("logs tool calls to stdout as JSON", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    logToolCall({ timestamp: new Date().toISOString(), tool: "get_payment", args: { paymentId: "ch_1" }, success: true, durationMs: 42 });
    expect(spy).toHaveBeenCalledTimes(1);
    const logged = JSON.parse(spy.mock.calls[0][0] as string);
    expect(logged.type).toBe("audit");
    expect(logged.tool).toBe("get_payment");
    expect(logged.success).toBe(true);
    spy.mockRestore();
  });

  it("retrieves recent entries", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    logToolCall({ timestamp: new Date().toISOString(), tool: "list_payments", args: {}, success: true, durationMs: 10 });
    const entries = getRecentAuditEntries(10);
    expect(entries.length).toBeGreaterThan(0);
    expect(entries[entries.length - 1].tool).toBe("list_payments");
    spy.mockRestore();
  });

  it("withAudit wraps successful calls", async () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    const result = await withAudit("get_account_info", {}, "acc_1", async () => ({ name: "Test" }));
    expect(result).toEqual({ name: "Test" });
    spy.mockRestore();
  });

  it("withAudit logs errors and re-throws", async () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    await expect(
      withAudit("get_payment", { paymentId: "bad" }, "acc_1", async () => { throw new Error("Not found"); })
    ).rejects.toThrow("Not found");
    spy.mockRestore();
  });
});
