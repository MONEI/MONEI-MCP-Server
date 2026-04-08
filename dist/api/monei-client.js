/**
 * MONEI API Client
 *
 * Lightweight wrapper around the MONEI REST API.
 * Only exposes methods for ALLOWED operations.
 *
 * @see https://docs.monei.com/api
 */
export class MoneiApiClient {
    baseUrl;
    accessToken;
    constructor(accessToken, baseUrl = "https://api.monei.com/v1") {
        this.accessToken = accessToken;
        this.baseUrl = baseUrl;
    }
    // ─── Payment Links ───────────────────────────────────────
    /**
     * Create a payment (generates a payment link via nextAction.redirectUrl)
     */
    async createPayment(params) {
        return this.request("POST", "/payments", {
            ...params,
            generatePaymentToken: false,
        });
    }
    // ─── Payment Retrieval (Read-Only) ──────────────────────
    /**
     * Get a single payment by ID
     */
    async getPayment(paymentId) {
        return this.request("GET", `/payments/${paymentId}`);
    }
    /**
     * List payments with optional filters
     */
    async listPayments(params) {
        const query = params ? this.toQueryString(params) : "";
        return this.request("GET", `/payments${query}`);
    }
    // ─── Subscriptions (Read-Only) ──────────────────────────
    /**
     * Get a single subscription by ID
     */
    async getSubscription(subscriptionId) {
        return this.request("GET", `/subscriptions/${subscriptionId}`);
    }
    /**
     * List subscriptions with optional filters
     */
    async listSubscriptions(params) {
        const query = params ? this.toQueryString(params) : "";
        return this.request("GET", `/subscriptions${query}`);
    }
    // ─── Account Info ───────────────────────────────────────
    /**
     * Get merchant account information
     */
    async getAccountInfo() {
        return this.request("GET", "/merchants/me");
    }
    // ─── HTTP Layer ─────────────────────────────────────────
    async request(method, path, body) {
        const url = `${this.baseUrl}${path}`;
        const headers = {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
            "User-Agent": "MONEI-MCP-Server/0.1.0",
        };
        const options = { method, headers };
        if (body && (method === "POST" || method === "PUT" || method === "PATCH")) {
            options.body = JSON.stringify(body);
        }
        const response = await fetch(url, options);
        if (!response.ok) {
            const errorBody = await response.text();
            throw new MoneiApiError(`MONEI API error ${response.status}: ${errorBody}`, response.status, errorBody);
        }
        return (await response.json());
    }
    toQueryString(params) {
        const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null);
        if (entries.length === 0)
            return "";
        const searchParams = new URLSearchParams();
        for (const [key, value] of entries) {
            searchParams.set(key, String(value));
        }
        return `?${searchParams.toString()}`;
    }
}
export class MoneiApiError extends Error {
    statusCode;
    responseBody;
    constructor(message, statusCode, responseBody) {
        super(message);
        this.statusCode = statusCode;
        this.responseBody = responseBody;
        this.name = "MoneiApiError";
    }
}
//# sourceMappingURL=monei-client.js.map