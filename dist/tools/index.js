/**
 * Tool Registry
 *
 * Central registry for all MCP tools. Handles:
 * - Registration of allowed tools
 * - Routing tool calls to the appropriate handler
 * - Blocking restricted operations with clear messages
 */
import { RESTRICTED_OPERATIONS, RESTRICTION_REASONS, } from "../types/index.js";
import { generatePaymentLinkTool, getPaymentTool, listPaymentsTool, GeneratePaymentLinkInput, GetPaymentInput, ListPaymentsInput, } from "./payments.js";
import { getSubscriptionTool, listSubscriptionsTool, GetSubscriptionInput, ListSubscriptionsInput, } from "./subscriptions.js";
import { getAccountInfoTool } from "./account.js";
// ─── All Allowed Tool Definitions ────────────────────────────
export const TOOL_DEFINITIONS = [
    generatePaymentLinkTool,
    getPaymentTool,
    listPaymentsTool,
    getSubscriptionTool,
    listSubscriptionsTool,
    getAccountInfoTool,
];
// ─── Tool Call Router ────────────────────────────────────────
export async function handleToolCall(toolName, args, apiClient) {
    // 1. Check if this is a restricted operation
    if (isRestrictedOperation(toolName)) {
        return blockRestrictedOperation(toolName);
    }
    // 2. Route to the appropriate handler
    try {
        switch (toolName) {
            case "generate_payment_link":
                return await handleGeneratePaymentLink(args, apiClient);
            case "get_payment":
                return await handleGetPayment(args, apiClient);
            case "list_payments":
                return await handleListPayments(args, apiClient);
            case "get_subscription":
                return await handleGetSubscription(args, apiClient);
            case "list_subscriptions":
                return await handleListSubscriptions(args, apiClient);
            case "get_account_info":
                return await handleGetAccountInfo(apiClient);
            default:
                return {
                    content: [
                        {
                            type: "text",
                            text: `Unknown tool: "${toolName}". Available tools: ${TOOL_DEFINITIONS.map((t) => t.name).join(", ")}`,
                        },
                    ],
                    isError: true,
                };
        }
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
            content: [{ type: "text", text: `Error: ${message}` }],
            isError: true,
        };
    }
}
// ─── Tool Handlers ───────────────────────────────────────────
async function handleGeneratePaymentLink(args, client) {
    const input = GeneratePaymentLinkInput.parse(args);
    const payment = await client.createPayment({
        amount: input.amount,
        currency: input.currency,
        orderId: input.orderId,
        description: input.description,
        customer: input.customerEmail || input.customerName
            ? {
                email: input.customerEmail,
                name: input.customerName,
            }
            : undefined,
        expireAt: input.expireAt,
    });
    const paymentUrl = payment.nextAction?.redirectUrl ?? `https://pay.monei.com/${payment.id}`;
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify({
                    success: true,
                    paymentId: payment.id,
                    paymentUrl,
                    amount: payment.amount,
                    currency: payment.currency,
                    status: payment.status,
                    description: payment.description,
                }, null, 2),
            },
        ],
    };
}
async function handleGetPayment(args, client) {
    const input = GetPaymentInput.parse(args);
    const payment = await client.getPayment(input.paymentId);
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(payment, null, 2),
            },
        ],
    };
}
async function handleListPayments(args, client) {
    const input = ListPaymentsInput.parse(args);
    const result = await client.listPayments({
        limit: input.limit,
        offset: input.offset,
        status: input.status,
        fromDate: input.fromDate,
        toDate: input.toDate,
        orderId: input.orderId,
    });
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify({
                    payments: result.data,
                    count: result.data.length,
                    hasMore: result.hasMore,
                }, null, 2),
            },
        ],
    };
}
async function handleGetSubscription(args, client) {
    const input = GetSubscriptionInput.parse(args);
    const subscription = await client.getSubscription(input.subscriptionId);
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(subscription, null, 2),
            },
        ],
    };
}
async function handleListSubscriptions(args, client) {
    const input = ListSubscriptionsInput.parse(args);
    const result = await client.listSubscriptions({
        limit: input.limit,
        offset: input.offset,
        status: input.status,
    });
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify({
                    subscriptions: result.data,
                    count: result.data.length,
                    hasMore: result.hasMore,
                }, null, 2),
            },
        ],
    };
}
async function handleGetAccountInfo(client) {
    const info = await client.getAccountInfo();
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(info, null, 2),
            },
        ],
    };
}
// ─── Restriction Enforcement ─────────────────────────────────
function isRestrictedOperation(toolName) {
    return RESTRICTED_OPERATIONS.includes(toolName);
}
function blockRestrictedOperation(operation) {
    const reason = RESTRICTION_REASONS[operation] ??
        "This operation is not available through the AI assistant.";
    return {
        content: [
            {
                type: "text",
                text: [
                    `⛔ Operation "${operation}" is restricted.`,
                    "",
                    reason,
                    "",
                    "Please use the MONEI Dashboard at https://dashboard.monei.com to perform this action.",
                ].join("\n"),
            },
        ],
        isError: true,
    };
}
//# sourceMappingURL=index.js.map