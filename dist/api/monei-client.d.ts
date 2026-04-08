/**
 * MONEI API Client
 *
 * Lightweight wrapper around the MONEI REST API.
 * Only exposes methods for ALLOWED operations.
 *
 * @see https://docs.monei.com/api
 */
import type { MoneiPayment, MoneiSubscription, MoneiListResponse } from "../types/index.js";
export interface CreatePaymentLinkParams {
    amount: number;
    currency: string;
    orderId?: string;
    description?: string;
    customer?: {
        email?: string;
        name?: string;
        phone?: string;
    };
    callbackUrl?: string;
    completeUrl?: string;
    cancelUrl?: string;
    expireAt?: number;
    allowedPaymentMethods?: string[];
}
export interface ListPaymentsParams {
    limit?: number;
    offset?: number;
    status?: string;
    fromDate?: string;
    toDate?: string;
    orderId?: string;
}
export interface ListSubscriptionsParams {
    limit?: number;
    offset?: number;
    status?: string;
}
export declare class MoneiApiClient {
    private readonly baseUrl;
    private readonly accessToken;
    constructor(accessToken: string, baseUrl?: string);
    /**
     * Create a payment (generates a payment link via nextAction.redirectUrl)
     */
    createPayment(params: CreatePaymentLinkParams): Promise<MoneiPayment>;
    /**
     * Get a single payment by ID
     */
    getPayment(paymentId: string): Promise<MoneiPayment>;
    /**
     * List payments with optional filters
     */
    listPayments(params?: ListPaymentsParams): Promise<MoneiListResponse<MoneiPayment>>;
    /**
     * Get a single subscription by ID
     */
    getSubscription(subscriptionId: string): Promise<MoneiSubscription>;
    /**
     * List subscriptions with optional filters
     */
    listSubscriptions(params?: ListSubscriptionsParams): Promise<MoneiListResponse<MoneiSubscription>>;
    /**
     * Get merchant account information
     */
    getAccountInfo(): Promise<Record<string, unknown>>;
    private request;
    private toQueryString;
}
export declare class MoneiApiError extends Error {
    readonly statusCode: number;
    readonly responseBody: string;
    constructor(message: string, statusCode: number, responseBody: string);
}
//# sourceMappingURL=monei-client.d.ts.map