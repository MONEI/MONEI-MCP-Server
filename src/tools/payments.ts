import type { MoneiGraphQLClient } from "../api/monei-client.js";

export const paymentToolDefinitions = [
  {
    name: "generate_payment_link",
    description: "Create a new payment and generate a shareable payment link. Amount is in cents (€10.50 = 1050).",
    inputSchema: {
      type: "object" as const,
      properties: {
        amount: { type: "number", description: "Amount in smallest currency unit (cents). €10.50 = 1050" },
        currency: { type: "string", description: "ISO 4217 currency code (default: EUR)", default: "EUR" },
        orderId: { type: "string", description: "Your internal order reference" },
        description: { type: "string", description: "Payment description shown to the customer" },
        customerEmail: { type: "string", description: "Customer email address" },
        customerName: { type: "string", description: "Customer name" },
        customerPhone: { type: "string", description: "Customer phone number" },
      },
      required: ["amount"],
    },
    annotations: { title: "Generate Payment Link", readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
  },
  {
    name: "get_payment",
    description: "Retrieve details of a specific payment by its ID. Returns status, amount, customer info, payment method, and timestamps.",
    inputSchema: {
      type: "object" as const,
      properties: { paymentId: { type: "string", description: "The MONEI payment/charge ID" } },
      required: ["paymentId"],
    },
    annotations: { title: "Get Payment Details", readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  {
    name: "list_payments",
    description: "Search and filter your payment history. Returns a paginated list of payments.",
    inputSchema: {
      type: "object" as const,
      properties: {
        search: { type: "string", description: "Free-text search across payment fields" },
        status: { type: "string", description: "Filter by payment status", enum: ["SUCCEEDED","FAILED","PENDING","AUTHORIZED","EXPIRED","REFUNDED","PARTIALLY_REFUNDED","CANCELLED"] },
        limit: { type: "number", description: "Max results (default 20, max 100)", default: 20 },
        offset: { type: "number", description: "Pagination offset", default: 0 },
      },
    },
    annotations: { title: "List Payments", readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  {
    name: "get_payments_kpi",
    description: "Get payment analytics and KPIs for a date range. Returns totals, success/failed/refunded counts, and time-series data. Dates are Unix timestamps (seconds).",
    inputSchema: {
      type: "object" as const,
      properties: {
        start: { type: "number", description: "Start date as Unix timestamp (seconds)" },
        end: { type: "number", description: "End date as Unix timestamp (seconds)" },
        interval: { type: "string", description: "Time bucket interval", enum: ["hour","day","week","month"], default: "day" },
        timezone: { type: "string", description: "IANA timezone (e.g. Europe/Madrid)" },
        currency: { type: "string", description: "Filter by currency (e.g. EUR)" },
      },
    },
    annotations: { title: "Get Payment KPIs", readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  {
    name: "send_payment_link",
    description: "Send an existing payment link to a customer via email or SMS.",
    inputSchema: {
      type: "object" as const,
      properties: {
        paymentId: { type: "string", description: "The MONEI payment/charge ID" },
        customerEmail: { type: "string", description: "Email address to send to" },
        customerPhone: { type: "string", description: "Phone number to send via SMS" },
      },
      required: ["paymentId"],
    },
    annotations: { title: "Send Payment Link", readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
  },
];

export async function handlePaymentTool(
  toolName: string, args: Record<string, unknown>, client: MoneiGraphQLClient
): Promise<unknown> {
  switch (toolName) {
    case "generate_payment_link": {
      const input: Record<string, unknown> = { amount: args.amount as number, currency: (args.currency as string) || "EUR" };
      if (args.orderId) input.orderId = args.orderId;
      if (args.description) input.description = args.description;
      if (args.customerEmail || args.customerName || args.customerPhone) {
        const customer: Record<string, unknown> = {};
        if (args.customerEmail) customer.email = args.customerEmail;
        if (args.customerName) customer.name = args.customerName;
        if (args.customerPhone) customer.phone = args.customerPhone;
        input.customer = customer;
      }
      return client.createPayment(input as any);
    }
    case "get_payment": return client.getCharge(args.paymentId as string);
    case "list_payments": return client.listCharges({ search: args.search as string | undefined, status: args.status as string | undefined, size: (args.limit as number) || 20, from: (args.offset as number) || 0 });
    case "get_payments_kpi": return client.getChargesKPI({ start: args.start as number | undefined, end: args.end as number | undefined, interval: args.interval as any, timezone: args.timezone as string | undefined, currency: args.currency as string | undefined });
    case "send_payment_link": return client.sendPaymentLink({ chargeId: args.paymentId as string, customerEmail: args.customerEmail as string | undefined, customerPhone: args.customerPhone as string | undefined });
    default: throw new Error(`Unknown payment tool: ${toolName}`);
  }
}
