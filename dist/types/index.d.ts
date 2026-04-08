/**
 * MONEI MCP Server — Shared Types
 */
export interface MoneiPayment {
    id: string;
    amount: number;
    currency: string;
    orderId?: string;
    description?: string;
    status: PaymentStatus;
    statusCode?: number;
    statusMessage?: string;
    customer?: MoneiCustomer;
    billingDetails?: MoneiBillingDetails;
    shippingDetails?: MoneiShippingDetails;
    paymentMethod?: MoneiPaymentMethod;
    nextAction?: MoneiNextAction;
    createdAt: number;
    updatedAt: number;
    livemode: boolean;
}
export type PaymentStatus = "SUCCEEDED" | "FAILED" | "CANCELED" | "PENDING" | "AUTHORIZED" | "EXPIRED" | "PARTIALLY_REFUNDED" | "REFUNDED";
export interface MoneiCustomer {
    email?: string;
    name?: string;
    phone?: string;
}
export interface MoneiBillingDetails {
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
    address?: MoneiAddress;
}
export interface MoneiShippingDetails {
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
    address?: MoneiAddress;
}
export interface MoneiAddress {
    country?: string;
    city?: string;
    line1?: string;
    line2?: string;
    zip?: string;
    state?: string;
}
export interface MoneiPaymentMethod {
    method?: string;
    card?: {
        brand?: string;
        last4?: string;
        expMonth?: number;
        expYear?: number;
        country?: string;
    };
}
export interface MoneiNextAction {
    type: string;
    redirectUrl?: string;
    mustRedirect?: boolean;
}
export interface MoneiSubscription {
    id: string;
    status: string;
    amount: number;
    currency: string;
    description?: string;
    interval: string;
    intervalCount: number;
    currentPeriodStart?: number;
    currentPeriodEnd?: number;
    createdAt: number;
    canceledAt?: number;
}
export interface MoneiPaymentLink {
    id: string;
    url: string;
    amount: number;
    currency: string;
    description?: string;
    expiresAt?: number;
    status: string;
}
export interface MoneiListResponse<T> {
    data: T[];
    hasMore: boolean;
    totalCount?: number;
}
export interface OAuthTokens {
    accessToken: string;
    refreshToken?: string;
    expiresAt: number;
    scope: string;
    accountId: string;
}
export interface ServerConfig {
    port: number;
    host: string;
    moneiApiBaseUrl: string;
    oauth: {
        clientId: string;
        clientSecret: string;
        redirectUri: string;
    };
}
export declare const RESTRICTED_OPERATIONS: readonly ["refund_payment", "charge_card", "charge_bizum", "card_payout", "bizum_payout", "delete_subscription", "cancel_subscription", "modify_account_settings"];
export type RestrictedOperation = (typeof RESTRICTED_OPERATIONS)[number];
export declare const RESTRICTION_REASONS: Record<RestrictedOperation, string>;
//# sourceMappingURL=index.d.ts.map