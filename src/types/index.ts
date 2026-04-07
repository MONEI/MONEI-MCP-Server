/**
 * MONEI MCP Server — Shared Types
 */

// ─── MONEI API Types ──────────────────────────────────────────

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

export type PaymentStatus =
  | "SUCCEEDED"
  | "FAILED"
  | "CANCELED"
  | "PENDING"
  | "AUTHORIZED"
  | "EXPIRED"
  | "PARTIALLY_REFUNDED"
  | "REFUNDED";

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

// ─── OAuth Types ──────────────────────────────────────────────

export interface OAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  scope: string;
  accountId: string;
}

// ─── Server Config ────────────────────────────────────────────

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

// ─── Restricted Operations ────────────────────────────────────

export const RESTRICTED_OPERATIONS = [
  "refund_payment",
  "charge_card",
  "charge_bizum",
  "card_payout",
  "bizum_payout",
  "delete_subscription",
  "cancel_subscription",
  "modify_account_settings",
] as const;

export type RestrictedOperation = (typeof RESTRICTED_OPERATIONS)[number];

export const RESTRICTION_REASONS: Record<RestrictedOperation, string> = {
  refund_payment:
    "Refunds involve financial risk and must be performed through the MONEI Dashboard (dashboard.monei.com) with explicit merchant action.",
  charge_card:
    "Initiating card charges requires full PCI compliance context and cardholder consent flows that cannot be handled through an AI assistant.",
  charge_bizum:
    "Bizum charges require direct consumer authorization flows that must be initiated through proper payment channels.",
  card_payout:
    "Card payouts involve funds disbursement and require compliance controls beyond the scope of AI assistant operations.",
  bizum_payout:
    "Bizum payouts involve outbound money movement and require compliance controls beyond the scope of AI assistant operations.",
  delete_subscription:
    "Subscription deletion is a destructive action and must be performed through the MONEI Dashboard.",
  cancel_subscription:
    "Subscription cancellation is a destructive action and must be performed through the MONEI Dashboard.",
  modify_account_settings:
    "Account settings modification is security-sensitive and must be performed through the MONEI Dashboard.",
};
