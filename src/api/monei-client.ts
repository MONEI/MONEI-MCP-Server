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
  errors?: Array<{ message: string; errorType?: string }>;
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
  customer?: { email?: string; name?: string; phone?: string };
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

// ─── GraphQL Fragments ──────────────────────────────────────

const CHARGE_FIELDS = `
  id amount currency refundedAmount authorizationCode description orderId
  status statusCode statusMessage livemode createdAt updatedAt
  customer { email name phone }
  paymentMethod { method type brand last4 country bank phoneNumber threeDSecure }
  shopifyDetails { orderId orderName }
`;

const SUBSCRIPTION_FIELDS = `
  id amount currency description status interval intervalCount
  currentPeriodStart currentPeriodEnd cancelAtPeriodEnd livemode createdAt updatedAt
  customer { email name phone }
  paymentMethod { method type brand last4 }
`;

const ACCOUNT_FIELDS = `
  id name email status livemode country defaultCurrency
  businessDetails { name url supportEmail supportPhone supportUrl }
  paymentMethods { card bizum applePay googlePay clickToPay paypal cofidis mbway multibanco }
`;

// ─── Client ─────────────────────────────────────────────────

export class MoneiGraphQLClient {
  private apiKey: string;
  private endpoint: string;

  constructor(config: MoneiClientConfig) {
    this.apiKey = config.apiKey;
    this.endpoint = config.graphqlEndpoint ?? "https://graphql.monei.com";
  }

  async execute<T = unknown>(query: string, variables?: Record<string, unknown>): Promise<T> {
    const body: Record<string, unknown> = { query };
    if (variables && Object.keys(variables).length > 0) body.variables = variables;

    const response = await fetch(this.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: this.apiKey },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`MONEI GraphQL HTTP ${response.status}: ${text}`);
    }

    const result = (await response.json()) as GraphQLResponse<T>;
    if (result.errors?.length) {
      throw new Error(`MONEI GraphQL error: ${result.errors.map(e => e.message).join("; ")}`);
    }
    if (!result.data) throw new Error("MONEI GraphQL: empty response data");
    return result.data;
  }

  async getAccount(): Promise<unknown> {
    const data = await this.execute<{ account: unknown }>(
      `query { account { ${ACCOUNT_FIELDS} } }`
    );
    return data.account;
  }

  async getCharge(id: string): Promise<unknown> {
    const data = await this.execute<{ charge: unknown }>(
      `query GetCharge($id: ID!) { charge(id: $id) { ${CHARGE_FIELDS} } }`,
      { id }
    );
    return data.charge;
  }

  async listCharges(filters?: ChargeFilters): Promise<unknown> {
    const vars: Record<string, unknown> = {};
    const args: string[] = [];
    const call: string[] = [];

    if (filters?.search) { args.push("$search: String"); call.push("search: $search"); vars.search = filters.search; }
    if (filters?.size) { args.push("$size: Int"); call.push("size: $size"); vars.size = filters.size; }
    if (filters?.from !== undefined) { args.push("$from: Int"); call.push("from: $from"); vars.from = filters.from; }
    if (filters?.status) { args.push("$filter: SearchableChargeFilterInput"); call.push("filter: $filter"); vars.filter = { status: { eq: filters.status } }; }

    const argDef = args.length ? `(${args.join(", ")})` : "";
    const callStr = call.length ? `(${call.join(", ")})` : "";

    const data = await this.execute<{ charges: unknown }>(
      `query ListCharges${argDef} { charges${callStr} { items { ${CHARGE_FIELDS} } total } }`,
      vars
    );
    return data.charges;
  }

  async getChargesKPI(params?: KPIParams): Promise<unknown> {
    const vars: Record<string, unknown> = {};
    const args: string[] = [];
    const call: string[] = [];

    if (params?.start !== undefined) { args.push("$start: Int"); call.push("start: $start"); vars.start = params.start; }
    if (params?.end !== undefined) { args.push("$end: Int"); call.push("end: $end"); vars.end = params.end; }
    if (params?.interval) { args.push("$interval: Interval"); call.push("interval: $interval"); vars.interval = params.interval; }
    if (params?.timezone) { args.push("$timezone: String"); call.push("timezone: $timezone"); vars.timezone = params.timezone; }
    if (params?.currency) { args.push("$currency: Currencies"); call.push("currency: $currency"); vars.currency = params.currency; }

    const argDef = args.length ? `(${args.join(", ")})` : "";
    const callStr = call.length ? `(${call.join(", ")})` : "";

    const data = await this.execute<{ chargesDateRangeKPI: unknown }>(
      `query ChargesKPI${argDef} { chargesDateRangeKPI${callStr} {
        totalAmount totalCount successAmount successCount
        failedAmount failedCount refundedAmount refundedCount averageAmount currency
        data { date totalAmount totalCount successAmount successCount }
      } }`,
      vars
    );
    return data.chargesDateRangeKPI;
  }

  async createPayment(input: CreatePaymentInput): Promise<unknown> {
    const data = await this.execute<{ createPayment: unknown }>(
      `mutation CreatePayment($input: CreatePaymentInput!) { createPayment(input: $input) { ${CHARGE_FIELDS} } }`,
      { input }
    );
    return data.createPayment;
  }

  async sendPaymentLink(input: SendPaymentLinkInput): Promise<unknown> {
    const data = await this.execute<{ sendPaymentLink: unknown }>(
      `mutation SendPaymentLink($input: SendPaymentLinkInput!) { sendPaymentLink(input: $input) { success } }`,
      { input }
    );
    return data.sendPaymentLink;
  }

  async getSubscription(id: string): Promise<unknown> {
    const data = await this.execute<{ subscription: unknown }>(
      `query GetSubscription($id: ID!) { subscription(id: $id) { ${SUBSCRIPTION_FIELDS} } }`,
      { id }
    );
    return data.subscription;
  }

  async listSubscriptions(filters?: SubscriptionFilters): Promise<unknown> {
    const vars: Record<string, unknown> = {};
    const args: string[] = [];
    const call: string[] = [];

    if (filters?.search) { args.push("$search: String"); call.push("search: $search"); vars.search = filters.search; }
    if (filters?.size) { args.push("$size: Int"); call.push("size: $size"); vars.size = filters.size; }
    if (filters?.from !== undefined) { args.push("$from: Int"); call.push("from: $from"); vars.from = filters.from; }
    if (filters?.status) { args.push("$filter: SearchableSubscriptionFilterInput"); call.push("filter: $filter"); vars.filter = { status: { eq: filters.status } }; }

    const argDef = args.length ? `(${args.join(", ")})` : "";
    const callStr = call.length ? `(${call.join(", ")})` : "";

    const data = await this.execute<{ subscriptions: unknown }>(
      `query ListSubscriptions${argDef} { subscriptions${callStr} { items { ${SUBSCRIPTION_FIELDS} } total } }`,
      vars
    );
    return data.subscriptions;
  }

  async introspect(): Promise<unknown> {
    const data = await this.execute<{ __schema: unknown }>(
      `query { __schema { queryType { name } mutationType { name }
        types { name kind fields { name args { name type { name kind } } type { name kind ofType { name kind } } } } } }`
    );
    return data.__schema;
  }
}
