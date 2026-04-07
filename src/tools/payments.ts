/**
 * Payment Tools
 *
 * MCP tools for payment operations:
 * ✅ generate_payment_link — Create a shareable payment URL
 * ✅ get_payment — Retrieve payment details by ID
 * ✅ list_payments — Search/filter transaction history
 */

import { z } from "zod";

// ─── Tool Definitions ────────────────────────────────────────

export const generatePaymentLinkTool = {
  name: "generate_payment_link",
  title: "Generate Payment Link",
  description:
    "Create a payment link that can be shared with a customer. Returns a URL the customer can use to complete the payment. Supports cards, Bizum, and other MONEI-enabled payment methods.",
  annotations: {
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: false,
    openWorldHint: true,
  },
  inputSchema: {
    type: "object" as const,
    properties: {
      amount: {
        type: "number",
        description:
          "Payment amount in the smallest currency unit (e.g., cents). For €10.50, use 1050.",
      },
      currency: {
        type: "string",
        description: "Three-letter ISO 4217 currency code (e.g., EUR, USD).",
        default: "EUR",
      },
      orderId: {
        type: "string",
        description:
          "Your internal order ID for reference. Must be unique per payment.",
      },
      description: {
        type: "string",
        description: "Payment description shown to the customer.",
      },
      customerEmail: {
        type: "string",
        description: "Customer email address for receipt delivery.",
      },
      customerName: {
        type: "string",
        description: "Customer full name.",
      },
      expireAt: {
        type: "number",
        description:
          "Unix timestamp (seconds) when the payment link expires. Optional.",
      },
    },
    required: ["amount", "currency"],
  },
};

export const getPaymentTool = {
  name: "get_payment",
  title: "Get Payment Details",
  description:
    "Retrieve the full details and current status of a payment by its ID. Returns amount, status, payment method, customer info, and timestamps.",
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: {
    type: "object" as const,
    properties: {
      paymentId: {
        type: "string",
        description: "The unique MONEI payment ID.",
      },
    },
    required: ["paymentId"],
  },
};

export const listPaymentsTool = {
  name: "list_payments",
  title: "List Payments",
  description:
    "List and search payments with optional filters. Returns a paginated list of transactions. Useful for checking recent sales, finding specific orders, or reviewing payment history.",
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: {
    type: "object" as const,
    properties: {
      limit: {
        type: "number",
        description: "Maximum number of payments to return (1-100, default 10).",
        default: 10,
      },
      offset: {
        type: "number",
        description: "Number of payments to skip for pagination.",
        default: 0,
      },
      status: {
        type: "string",
        description:
          "Filter by status: SUCCEEDED, FAILED, PENDING, AUTHORIZED, CANCELED, EXPIRED, REFUNDED, PARTIALLY_REFUNDED.",
        enum: [
          "SUCCEEDED",
          "FAILED",
          "PENDING",
          "AUTHORIZED",
          "CANCELED",
          "EXPIRED",
          "REFUNDED",
          "PARTIALLY_REFUNDED",
        ],
      },
      fromDate: {
        type: "string",
        description: "Filter payments created after this date (ISO 8601).",
      },
      toDate: {
        type: "string",
        description: "Filter payments created before this date (ISO 8601).",
      },
      orderId: {
        type: "string",
        description: "Filter by your internal order ID.",
      },
    },
  },
};

// ─── Input Validation Schemas ────────────────────────────────

export const GeneratePaymentLinkInput = z.object({
  amount: z.number().int().positive("Amount must be a positive integer (cents)"),
  currency: z.string().length(3).default("EUR"),
  orderId: z.string().optional(),
  description: z.string().optional(),
  customerEmail: z.string().email().optional(),
  customerName: z.string().optional(),
  expireAt: z.number().int().optional(),
});

export const GetPaymentInput = z.object({
  paymentId: z.string().min(1, "Payment ID is required"),
});

export const ListPaymentsInput = z.object({
  limit: z.number().int().min(1).max(100).default(10),
  offset: z.number().int().min(0).default(0),
  status: z.string().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  orderId: z.string().optional(),
});
