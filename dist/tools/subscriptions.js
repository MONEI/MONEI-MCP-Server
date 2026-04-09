export const subscriptionToolDefinitions = [
    {
        name: "get_subscription",
        description: "Get details of a specific subscription by ID.",
        inputSchema: {
            type: "object",
            properties: { subscriptionId: { type: "string", description: "The MONEI subscription ID" } },
            required: ["subscriptionId"],
        },
        annotations: { title: "Get Subscription", readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    {
        name: "list_subscriptions",
        description: "List subscriptions with optional filtering.",
        inputSchema: {
            type: "object",
            properties: {
                search: { type: "string", description: "Free-text search" },
                status: { type: "string", description: "Filter by status", enum: ["ACTIVE", "PAUSED", "CANCELLED", "PAST_DUE", "UNPAID"] },
                limit: { type: "number", description: "Max results (default 20)", default: 20 },
                offset: { type: "number", description: "Pagination offset", default: 0 },
            },
        },
        annotations: { title: "List Subscriptions", readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
];
export async function handleSubscriptionTool(toolName, args, client) {
    switch (toolName) {
        case "get_subscription": return client.getSubscription(args.subscriptionId);
        case "list_subscriptions": return client.listSubscriptions({ search: args.search, status: args.status, size: args.limit || 20, from: args.offset || 0 });
        default: throw new Error(`Unknown subscription tool: ${toolName}`);
    }
}
//# sourceMappingURL=subscriptions.js.map