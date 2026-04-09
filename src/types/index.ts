/**
 * Shared types for the MONEI MCP Server
 */

export interface ServerConfig {
  port: number;
  host: string;
  moneiGraphqlEndpoint: string;
  oauth: {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
  };
}

export interface OAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  scope: string;
  accountId: string;
}

export interface RestrictedOperation {
  name: string;
  graphqlOperation: string;
  reason: string;
  alternative: string;
}

export const RESTRICTED_OPERATIONS: RestrictedOperation[] = [
  { name: "refundPayment", graphqlOperation: "refundPayment", reason: "Refunds involve financial risk and require manual review.", alternative: "https://dashboard.monei.com" },
  { name: "capturePayment", graphqlOperation: "capturePayment", reason: "Payment capture requires PCI context and authorization verification.", alternative: "https://dashboard.monei.com" },
  { name: "cancelPayment", graphqlOperation: "cancelPayment", reason: "Payment cancellation is a destructive action.", alternative: "https://dashboard.monei.com" },
  { name: "cancelSubscription", graphqlOperation: "cancelSubscription", reason: "Cancelling subscriptions is destructive and affects recurring revenue.", alternative: "https://dashboard.monei.com" },
  { name: "updateAccount", graphqlOperation: "updateAccount", reason: "Account settings changes are security-sensitive.", alternative: "https://dashboard.monei.com" },
  { name: "deleteWebhook", graphqlOperation: "deleteWebhook", reason: "Webhook deletion can break integrations.", alternative: "https://dashboard.monei.com" },
  { name: "createApiKey", graphqlOperation: "createApiKey", reason: "API key creation is security-sensitive.", alternative: "https://dashboard.monei.com/settings/api" },
  { name: "deleteApiKey", graphqlOperation: "deleteApiKey", reason: "API key deletion can break integrations.", alternative: "https://dashboard.monei.com/settings/api" },
];

export function isRestricted(operationName: string): RestrictedOperation | undefined {
  return RESTRICTED_OPERATIONS.find(op => op.name === operationName || op.graphqlOperation === operationName);
}
