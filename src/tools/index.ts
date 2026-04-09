import type { MoneiGraphQLClient } from "../api/monei-client.js";
import { isRestricted } from "../types/index.js";
import { paymentToolDefinitions, handlePaymentTool } from "./payments.js";
import { subscriptionToolDefinitions, handleSubscriptionTool } from "./subscriptions.js";
import { accountToolDefinitions, handleAccountTool } from "./account.js";

export const ALL_TOOL_DEFINITIONS = [
  ...paymentToolDefinitions,
  ...subscriptionToolDefinitions,
  ...accountToolDefinitions,
];

const PAYMENT_TOOLS = new Set(paymentToolDefinitions.map(t => t.name));
const SUBSCRIPTION_TOOLS = new Set(subscriptionToolDefinitions.map(t => t.name));
const ACCOUNT_TOOLS = new Set(accountToolDefinitions.map(t => t.name));

export async function handleToolCall(
  toolName: string,
  args: Record<string, unknown>,
  client: MoneiGraphQLClient
): Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }> {
  const restricted = isRestricted(toolName);
  if (restricted) {
    return {
      content: [{ type: "text", text: `⛔ Operation "${restricted.name}" is not allowed through AI assistants.\n\nReason: ${restricted.reason}\n\nPlease use the MONEI Dashboard: ${restricted.alternative}` }],
      isError: true,
    };
  }

  try {
    let result: unknown;
    if (PAYMENT_TOOLS.has(toolName)) result = await handlePaymentTool(toolName, args, client);
    else if (SUBSCRIPTION_TOOLS.has(toolName)) result = await handleSubscriptionTool(toolName, args, client);
    else if (ACCOUNT_TOOLS.has(toolName)) result = await handleAccountTool(toolName, args, client);
    else return { content: [{ type: "text", text: `Unknown tool: ${toolName}. Available: ${ALL_TOOL_DEFINITIONS.map(t => t.name).join(", ")}` }], isError: true };

    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  } catch (error) {
    return { content: [{ type: "text", text: `Error executing ${toolName}: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
  }
}
