import type { MoneiGraphQLClient } from "../api/monei-client.js";

export const subscriptionToolDefinitions = [
  {
    name: "get_subscription",
    description: "Get details of a specific subscription by ID.",
    inputSchema: {
      type: "object" as const,
      properties: { subscriptionId: { type: "string", description: "The MONEI subscription ID" } },
      required: ["subscriptionId"],
    },
    annotations: { title: "Get Subscription", readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  {
    name: "list_subscriptions",
    description: "List subscriptions with optional filtering.",
    inputSchema: {
      type: "object" as const,
      properties: {
        search: { type: "string", description: "Free-text search" },
        status: { type: "string", description: "Filter by status", enum: ["ACTIVE","PAUSED","CANCELLED","PAST_DUE","UNPAID"] },
        limit: { type: "number", description: "Max results (default 20)", default: 20 },
        offset: { type: "number", description: "Pagination offset", default: 0 },
      },
    },
    annotations: { title: "List Subscriptions", readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
];

export async function handleSubscriptionTool(
  toolName: string, args: Record<string, unknown>, client: MoneiGraphQLClient
): Promise<unknown> {
  switch (toolName) {
    case "get_subscription": return client.getSubscription(args.subscriptionId as string);
    case "list_subscriptions": return client.listSubscriptions({ search: args.search as string | undefined, status: args.status as string | undefined, size: (args.limit as number) || 20, from: (args.offset as number) || 0 });
    default: throw new Error(`Unknown subscription tool: ${toolName}`);
  }
}
