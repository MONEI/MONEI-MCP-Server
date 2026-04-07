/**
 * Tool Routing Tests
 *
 * Verifies that allowed tool calls are correctly routed
 * to their API handlers and return proper results.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { handleToolCall } from "../../src/tools/index.js";
import type { MoneiApiClient } from "../../src/api/monei-client.js";

const mockApiClient = {
  createPayment: vi.fn(),
  getPayment: vi.fn(),
  listPayments: vi.fn(),
  getSubscription: vi.fn(),
  listSubscriptions: vi.fn(),
  getAccountInfo: vi.fn(),
} as unknown as MoneiApiClient;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Tool Routing — Payments", () => {
  it("generate_payment_link calls createPayment", async () => {
    (mockApiClient.createPayment as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "pay_test_123",
      amount: 1050,
      currency: "EUR",
      status: "PENDING",
      nextAction: { redirectUrl: "https://pay.monei.com/pay_test_123" },
    });

    const result = await handleToolCall(
      "generate_payment_link",
      { amount: 1050, currency: "EUR", description: "Test payment" },
      mockApiClient
    );

    expect(result.isError).toBeUndefined();
    expect(mockApiClient.createPayment).toHaveBeenCalledOnce();

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.success).toBe(true);
    expect(parsed.paymentId).toBe("pay_test_123");
    expect(parsed.paymentUrl).toContain("pay.monei.com");
  });

  it("get_payment calls getPayment with correct ID", async () => {
    (mockApiClient.getPayment as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "pay_abc",
      amount: 500,
      currency: "EUR",
      status: "SUCCEEDED",
    });

    const result = await handleToolCall(
      "get_payment",
      { paymentId: "pay_abc" },
      mockApiClient
    );

    expect(result.isError).toBeUndefined();
    expect(mockApiClient.getPayment).toHaveBeenCalledWith("pay_abc");
  });

  it("list_payments calls listPayments with filters", async () => {
    (mockApiClient.listPayments as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [],
      hasMore: false,
    });

    const result = await handleToolCall(
      "list_payments",
      { limit: 5, status: "SUCCEEDED" },
      mockApiClient
    );

    expect(result.isError).toBeUndefined();
    expect(mockApiClient.listPayments).toHaveBeenCalledOnce();

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.payments).toEqual([]);
    expect(parsed.hasMore).toBe(false);
  });
});

describe("Tool Routing — Subscriptions", () => {
  it("get_subscription calls getSubscription with correct ID", async () => {
    (mockApiClient.getSubscription as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "sub_xyz",
      status: "ACTIVE",
      amount: 999,
      currency: "EUR",
      interval: "month",
    });

    const result = await handleToolCall(
      "get_subscription",
      { subscriptionId: "sub_xyz" },
      mockApiClient
    );

    expect(result.isError).toBeUndefined();
    expect(mockApiClient.getSubscription).toHaveBeenCalledWith("sub_xyz");
  });

  it("list_subscriptions calls listSubscriptions", async () => {
    (mockApiClient.listSubscriptions as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [],
      hasMore: false,
    });

    const result = await handleToolCall(
      "list_subscriptions",
      { limit: 10 },
      mockApiClient
    );

    expect(result.isError).toBeUndefined();
    expect(mockApiClient.listSubscriptions).toHaveBeenCalledOnce();
  });
});

describe("Tool Routing — Account", () => {
  it("get_account_info calls getAccountInfo", async () => {
    (mockApiClient.getAccountInfo as ReturnType<typeof vi.fn>).mockResolvedValue({
      name: "Test Merchant",
      paymentMethods: ["card", "bizum"],
    });

    const result = await handleToolCall(
      "get_account_info",
      {},
      mockApiClient
    );

    expect(result.isError).toBeUndefined();
    expect(mockApiClient.getAccountInfo).toHaveBeenCalledOnce();
  });
});

describe("Tool Routing — Error Handling", () => {
  it("returns error content when API throws", async () => {
    (mockApiClient.getPayment as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("API timeout")
    );

    const result = await handleToolCall(
      "get_payment",
      { paymentId: "pay_fail" },
      mockApiClient
    );

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Error");
  });
});
