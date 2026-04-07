/**
 * Subscription Tools
 *
 * MCP tools for subscription operations (READ-ONLY):
 * ✅ get_subscription — View subscription details
 * ✅ list_subscriptions — Browse subscriptions
 */

import { z } from "zod";

// ─── Tool Definitions ────────────────────────────────────────

export const getSubscriptionTool = {
  name: "get_subscription",
  title: "Get Subscription Details",
  description:
    "Retrieve the full details and current status of a subscription by its ID. Returns amount, interval, status, and billing period information.",
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: {
    type: "object" as const,
    properties: {
      subscriptionId: {
        type: "string",
        description: "The unique MONEI subscription ID.",
      },
    },
    required: ["subscriptionId"],
  },
};

export const listSubscriptionsTool = {
  name: "list_subscriptions",
  title: "List Subscriptions",
  description:
    "List subscriptions with optional filters. Returns active, paused, and past subscriptions.",
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: {
    type: "object" as const,
    properties: {
      limit: {
        type: "number",
        description:
          "Maximum number of subscriptions to return (1-100, default 10).",
        default: 10,
      },
      offset: {
        type: "number",
        description: "Number of subscriptions to skip for pagination.",
        default: 0,
      },
      status: {
        type: "string",
        description: "Filter by subscription status: ACTIVE, PAUSED, CANCELED.",
        enum: ["ACTIVE", "PAUSED", "CANCELED"],
      },
    },
  },
};

// ─── Input Validation Schemas ────────────────────────────────

export const GetSubscriptionInput = z.object({
  subscriptionId: z.string().min(1, "Subscription ID is required"),
});

export const ListSubscriptionsInput = z.object({
  limit: z.number().int().min(1).max(100).default(10),
  offset: z.number().int().min(0).default(0),
  status: z.string().optional(),
});
