/**
 * Shared types for the MONEI MCP Server
 */
export const RESTRICTED_OPERATIONS = [
    { name: "refundPayment", graphqlOperation: "refundPayment", reason: "Refunds involve financial risk and require manual review.", alternative: "https://dashboard.monei.com" },
    { name: "capturePayment", graphqlOperation: "capturePayment", reason: "Payment capture requires PCI context and authorization verification.", alternative: "https://dashboard.monei.com" },
    { name: "cancelPayment", graphqlOperation: "cancelPayment", reason: "Payment cancellation is a destructive action.", alternative: "https://dashboard.monei.com" },
    { name: "cancelSubscription", graphqlOperation: "cancelSubscription", reason: "Cancelling subscriptions is destructive and affects recurring revenue.", alternative: "https://dashboard.monei.com" },
    { name: "updateAccount", graphqlOperation: "updateAccount", reason: "Account settings changes are security-sensitive.", alternative: "https://dashboard.monei.com" },
    { name: "deleteWebhook", graphqlOperation: "deleteWebhook", reason: "Webhook deletion can break integrations.", alternative: "https://dashboard.monei.com" },
    { name: "createApiKey", graphqlOperation: "createApiKey", reason: "API key creation is security-sensitive.", alternative: "https://dashboard.monei.com/settings/api" },
    { name: "deleteApiKey", graphqlOperation: "deleteApiKey", reason: "API key deletion can break integrations.", alternative: "https://dashboard.monei.com/settings/api" },
];
export function isRestricted(operationName) {
    return RESTRICTED_OPERATIONS.find(op => op.name === operationName || op.graphqlOperation === operationName);
}
//# sourceMappingURL=index.js.map