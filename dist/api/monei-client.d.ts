/**
 * MONEI GraphQL API Client
 *
 * All MONEI operations go through the GraphQL API at https://graphql.monei.com
 * This replaces the previous REST client that used api.monei.com/v1.
 *
 * Authentication: API Key passed as Authorization header.
 * Docs: https://docs.monei.com/apis/graphql/
 */
export interface GraphQLResponse<T = unknown> {
    data?: T;
    errors?: Array<{
        message: string;
        errorType?: string;
    }>;
}
export interface MoneiClientConfig {
    apiKey: string;
    graphqlEndpoint?: string;
}
export interface ChargeFilters {
    status?: string;
    search?: string;
    size?: number;
    from?: number;
}
export interface CreatePaymentInput {
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
}
export interface SendPaymentLinkInput {
    chargeId: string;
    customerEmail?: string;
    customerPhone?: string;
}
export interface KPIParams {
    start?: number;
    end?: number;
    interval?: "hour" | "day" | "week" | "month";
    timezone?: string;
    currency?: string;
}
export interface SubscriptionFilters {
    status?: string;
    search?: string;
    size?: number;
    from?: number;
}
export declare class MoneiGraphQLClient {
    private apiKey;
    private endpoint;
    constructor(config: MoneiClientConfig);
    execute<T = unknown>(query: string, variables?: Record<string, unknown>): Promise<T>;
    getAccount(): Promise<unknown>;
    getCharge(id: string): Promise<unknown>;
    listCharges(filters?: ChargeFilters): Promise<unknown>;
    getChargesKPI(params?: KPIParams): Promise<unknown>;
    createPayment(input: CreatePaymentInput): Promise<unknown>;
    sendPaymentLink(input: SendPaymentLinkInput): Promise<unknown>;
    getSubscription(id: string): Promise<unknown>;
    listSubscriptions(filters?: SubscriptionFilters): Promise<unknown>;
    introspect(): Promise<unknown>;
}
//# sourceMappingURL=monei-client.d.ts.map