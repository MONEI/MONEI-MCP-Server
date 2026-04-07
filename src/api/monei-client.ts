/**
 * MONEI API Client
 *
 * Lightweight wrapper around the MONEI REST API.
 * Only exposes methods for ALLOWED operations.
 *
 * @see https://docs.monei.com/api
 */

import type {
  MoneiPayment,
  MoneiSubscription,
  MoneiListResponse,
} from "../types/index.js";

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

export class MoneiApiClient {
  private readonly baseUrl: string;
  private readonly accessToken: string;

  constructor(accessToken: string, baseUrl = "https://api.monei.com/v1") {
    this.accessToken = accessToken;
    this.baseUrl = baseUrl;
  }

  // ─── Payment Links ───────────────────────────────────────

  /**
   * Create a payment (generates a payment link via nextAction.redirectUrl)
   */
  async createPayment(params: CreatePaymentLinkParams): Promise<MoneiPayment> {
    return this.request<MoneiPayment>("POST", "/payments", {
      ...params,
      generatePaymentToken: false,
    });
  }

  // ─── Payment Retrieval (Read-Only) ──────────────────────

  /**
   * Get a single payment by ID
   */
  async getPayment(paymentId: string): Promise<MoneiPayment> {
    return this.request<MoneiPayment>("GET", `/payments/${paymentId}`);
  }

  /**
   * List payments with optional filters
   */
  async listPayments(
    params?: ListPaymentsParams
  ): Promise<MoneiListResponse<MoneiPayment>> {
    const query = params ? this.toQueryString(params) : "";
    return this.request<MoneiListResponse<MoneiPayment>>(
      "GET",
      `/payments${query}`
    );
  }

  // ─── Subscriptions (Read-Only) ──────────────────────────

  /**
   * Get a single subscription by ID
   */
  async getSubscription(subscriptionId: string): Promise<MoneiSubscription> {
    return this.request<MoneiSubscription>(
      "GET",
      `/subscriptions/${subscriptionId}`
    );
  }

  /**
   * List subscriptions with optional filters
   */
  async listSubscriptions(
    params?: ListSubscriptionsParams
  ): Promise<MoneiListResponse<MoneiSubscription>> {
    const query = params ? this.toQueryString(params) : "";
    return this.request<MoneiListResponse<MoneiSubscription>>(
      "GET",
      `/subscriptions${query}`
    );
  }

  // ─── Account Info ───────────────────────────────────────

  /**
   * Get merchant account information
   */
  async getAccountInfo(): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>("GET", "/merchants/me");
  }

  // ─── HTTP Layer ─────────────────────────────────────────

  private async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.accessToken}`,
      "Content-Type": "application/json",
      "User-Agent": "MONEI-MCP-Server/0.1.0",
    };

    const options: RequestInit = { method, headers };

    if (body && (method === "POST" || method === "PUT" || method === "PATCH")) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorBody = await response.text();
      throw new MoneiApiError(
        `MONEI API error ${response.status}: ${errorBody}`,
        response.status,
        errorBody
      );
    }

    return (await response.json()) as T;
  }

  private toQueryString(params: Record<string, unknown>): string {
    const entries = Object.entries(params).filter(
      ([, v]) => v !== undefined && v !== null
    );
    if (entries.length === 0) return "";
    const searchParams = new URLSearchParams();
    for (const [key, value] of entries) {
      searchParams.set(key, String(value));
    }
    return `?${searchParams.toString()}`;
  }
}

export class MoneiApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly responseBody: string
  ) {
    super(message);
    this.name = "MoneiApiError";
  }
}
