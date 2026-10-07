import { describe, it, expect } from "vitest";
import { isRestricted, RESTRICTED_OPERATIONS } from "../../src/types/index.js";
import { ALL_TOOL_DEFINITIONS, handleToolCall } from "../../src/tools/index.js";
import { MoneiGraphQLClient } from "../../src/api/monei-client.js";

describe("Tool Definitions", () => {
  it("exports all 8 expected tools", () => {
    const names = ALL_TOOL_DEFINITIONS.map(t => t.name);
    expect(names).toContain("generate_payment_link");
    expect(names).toContain("get_payment");
    expect(names).toContain("list_payments");
    expect(names).toContain("get_payments_kpi");
    expect(names).toContain("send_payment_link");
    expect(names).toContain("get_subscription");
    expect(names).toContain("list_subscriptions");
    expect(names).toContain("get_account_info");
    expect(names.length).toBe(8);
  });

  it("every tool has name, description, inputSchema, annotations", () => {
    for (const tool of ALL_TOOL_DEFINITIONS) {
      expect(tool.name).toBeTruthy();
      expect(tool.description).toBeTruthy();
      expect(tool.inputSchema).toBeDefined();
      expect(tool.inputSchema.type).toBe("object");
      expect(tool.annotations).toBeDefined();
      expect(typeof tool.annotations.readOnlyHint).toBe("boolean");
      expect(typeof tool.annotations.destructiveHint).toBe("boolean");
    }
  });

  it("only generate_payment_link and send_payment_link are writable", () => {
    const writable = ALL_TOOL_DEFINITIONS.filter(t => !t.annotations.readOnlyHint).map(t => t.name);
    expect(writable.sort()).toEqual(["generate_payment_link", "send_payment_link"].sort());
  });

  it("no tool has destructiveHint=true", () => {
    const destructive = ALL_TOOL_DEFINITIONS.filter(t => t.annotations.destructiveHint);
    expect(destructive).toHaveLength(0);
  });
});

describe("Restricted Operations", () => {
  it("blocks refundPayment", () => {
    const r = isRestricted("refundPayment");
    expect(r).toBeDefined();
    expect(r!.reason).toContain("Refund");
  });

  it("blocks cancelSubscription", () => {
    expect(isRestricted("cancelSubscription")).toBeDefined();
  });

  it("blocks capturePayment", () => {
    expect(isRestricted("capturePayment")).toBeDefined();
  });

  it("blocks cancelPayment", () => {
    expect(isRestricted("cancelPayment")).toBeDefined();
  });

  it("blocks updateAccount", () => {
    expect(isRestricted("updateAccount")).toBeDefined();
  });

  it("blocks createApiKey and deleteApiKey", () => {
    expect(isRestricted("createApiKey")).toBeDefined();
    expect(isRestricted("deleteApiKey")).toBeDefined();
  });

  it("blocks deleteWebhook", () => {
    expect(isRestricted("deleteWebhook")).toBeDefined();
  });

  it("allows get_payment", () => {
    expect(isRestricted("get_payment")).toBeUndefined();
  });

  it("allows generate_payment_link", () => {
    expect(isRestricted("generate_payment_link")).toBeUndefined();
  });

  it("all restricted ops point to dashboard.monei.com", () => {
    for (const op of RESTRICTED_OPERATIONS) {
      expect(op.alternative).toContain("dashboard.monei.com");
    }
  });
});

describe("handleToolCall", () => {
  const client = new MoneiGraphQLClient({ apiKey: "test" });

  it("returns error for restricted operations", async () => {
    const result = await handleToolCall("refundPayment", {}, client);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("not allowed");
    expect(result.content[0].text).toContain("dashboard.monei.com");
  });

  it("returns error for unknown tools", async () => {
    const result = await handleToolCall("nonexistent_tool", {}, client);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Unknown tool");
  });

  it("returns error with available tools list for unknown tool", async () => {
    const result = await handleToolCall("bad_tool", {}, client);
    expect(result.content[0].text).toContain("generate_payment_link");
    expect(result.content[0].text).toContain("get_account_info");
  });
});
