/**
 * Restriction Enforcement Tests
 *
 * These are the MOST CRITICAL tests in the project.
 * They verify that dangerous operations (refunds, charges, payouts)
 * are always blocked, regardless of how the tool call is crafted.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { handleToolCall, TOOL_DEFINITIONS } from "../../src/tools/index.js";
import {
  RESTRICTED_OPERATIONS,
  RESTRICTION_REASONS,
} from "../../src/types/index.js";
import type { MoneiApiClient } from "../../src/api/monei-client.js";

// Mock API client — should NEVER be called for restricted ops
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

describe("Restricted Operations", () => {
  describe("every restricted operation is blocked", () => {
    for (const operation of RESTRICTED_OPERATIONS) {
      it(`blocks "${operation}" with an error`, async () => {
        const result = await handleToolCall(operation, {}, mockApiClient);

        expect(result.isError).toBe(true);
        expect(result.content[0].text).toContain("restricted");
        expect(result.content[0].text).toContain("dashboard.monei.com");
      });

      it(`"${operation}" never calls the API client`, async () => {
        await handleToolCall(operation, {}, mockApiClient);

        expect(mockApiClient.createPayment).not.toHaveBeenCalled();
        expect(mockApiClient.getPayment).not.toHaveBeenCalled();
        expect(mockApiClient.listPayments).not.toHaveBeenCalled();
        expect(mockApiClient.getSubscription).not.toHaveBeenCalled();
        expect(mockApiClient.listSubscriptions).not.toHaveBeenCalled();
        expect(mockApiClient.getAccountInfo).not.toHaveBeenCalled();
      });

      it(`"${operation}" has a defined restriction reason`, () => {
        const reason =
          RESTRICTION_REASONS[operation as keyof typeof RESTRICTION_REASONS];
        expect(reason).toBeDefined();
        expect(reason.length).toBeGreaterThan(10);
      });
    }
  });

  describe("restriction bypasses are impossible", () => {
    it("blocks restricted ops even with extra args", async () => {
      const result = await handleToolCall(
        "refund_payment",
        { paymentId: "pay_123", amount: 1000, force: true },
        mockApiClient
      );
      expect(result.isError).toBe(true);
    });

    it("blocks restricted ops with empty args", async () => {
      const result = await handleToolCall(
        "charge_card",
        {},
        mockApiClient
      );
      expect(result.isError).toBe(true);
    });

    it("returns error for unknown tool names", async () => {
      const result = await handleToolCall(
        "delete_everything",
        {},
        mockApiClient
      );
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("Unknown tool");
    });

    it("blocks variations of restricted operations", async () => {
      const sneakyNames = [
        "refund_payment",
        "charge_card",
        "charge_bizum",
        "card_payout",
        "bizum_payout",
        "delete_subscription",
        "cancel_subscription",
        "modify_account_settings",
      ];

      for (const name of sneakyNames) {
        const result = await handleToolCall(name, {}, mockApiClient);
        expect(result.isError).toBe(true);
      }
    });
  });

  describe("allowed operations are NOT blocked", () => {
    const allowedTools = TOOL_DEFINITIONS.map((t) => t.name);

    it("has at least 5 allowed tools", () => {
      expect(allowedTools.length).toBeGreaterThanOrEqual(5);
    });

    it("none of the allowed tools appear in restricted list", () => {
      const restrictedSet = new Set(RESTRICTED_OPERATIONS);
      for (const tool of allowedTools) {
        expect(restrictedSet.has(tool as any)).toBe(false);
      }
    });
  });
});
