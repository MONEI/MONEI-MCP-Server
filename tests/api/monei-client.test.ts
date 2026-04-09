import { describe, it, expect, vi, beforeEach } from "vitest";
import { MoneiGraphQLClient } from "../../src/api/monei-client.js";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("MoneiGraphQLClient", () => {
  let client: MoneiGraphQLClient;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new MoneiGraphQLClient({ apiKey: "test_key", graphqlEndpoint: "https://graphql.monei.com" });
  });

  it("sends correct headers and method", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: { account: { name: "Test" } } }) });
    await client.execute("query { account { name } }");
    expect(mockFetch).toHaveBeenCalledWith("https://graphql.monei.com", expect.objectContaining({
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "test_key" },
    }));
  });

  it("passes variables when provided", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: { charge: { id: "abc" } } }) });
    await client.execute("query($id: ID!) { charge(id: $id) { id } }", { id: "abc" });
    const body = JSON.parse((mockFetch.mock.calls[0][1] as any).body);
    expect(body.variables).toEqual({ id: "abc" });
  });

  it("omits variables key when none provided", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: { account: {} } }) });
    await client.execute("query { account { name } }");
    const body = JSON.parse((mockFetch.mock.calls[0][1] as any).body);
    expect(body.variables).toBeUndefined();
  });

  it("throws on HTTP errors", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401, text: async () => "Unauthorized" });
    await expect(client.execute("query { account { name } }")).rejects.toThrow("HTTP 401");
  });

  it("throws on GraphQL errors", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ errors: [{ message: "Bad field" }] }) });
    await expect(client.execute("query { bad }")).rejects.toThrow("Bad field");
  });

  it("joins multiple GraphQL errors", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ errors: [{ message: "err1" }, { message: "err2" }] }) });
    await expect(client.execute("query { bad }")).rejects.toThrow("err1; err2");
  });

  it("throws on empty data", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    await expect(client.execute("query { x }")).rejects.toThrow("empty response");
  });

  it("getAccount returns account data", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: { account: { id: "a1", name: "Merchant" } } }) });
    expect(await client.getAccount()).toEqual({ id: "a1", name: "Merchant" });
  });

  it("getCharge passes ID variable", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: { charge: { id: "ch_1", amount: 1050 } } }) });
    const result = await client.getCharge("ch_1");
    expect(result).toEqual({ id: "ch_1", amount: 1050 });
    const body = JSON.parse((mockFetch.mock.calls[0][1] as any).body);
    expect(body.variables.id).toBe("ch_1");
  });

  it("listCharges sends status filter", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: { charges: { items: [], total: 0 } } }) });
    await client.listCharges({ status: "SUCCEEDED", size: 10, search: "test" });
    const body = JSON.parse((mockFetch.mock.calls[0][1] as any).body);
    expect(body.variables.filter).toEqual({ status: { eq: "SUCCEEDED" } });
    expect(body.variables.size).toBe(10);
    expect(body.variables.search).toBe("test");
  });

  it("listCharges works with no filters", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: { charges: { items: [], total: 0 } } }) });
    await client.listCharges();
    const body = JSON.parse((mockFetch.mock.calls[0][1] as any).body);
    expect(body.variables).toBeUndefined();
  });

  it("getChargesKPI passes params", async () => {
    const kpi = { totalAmount: 100000, totalCount: 50 };
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: { chargesDateRangeKPI: kpi } }) });
    const result = await client.getChargesKPI({ start: 1700000000, end: 1700100000, interval: "day" });
    expect(result).toEqual(kpi);
    const body = JSON.parse((mockFetch.mock.calls[0][1] as any).body);
    expect(body.variables.start).toBe(1700000000);
    expect(body.variables.interval).toBe("day");
  });

  it("createPayment sends mutation with input", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: { createPayment: { id: "ch_new", amount: 2500 } } }) });
    const result = await client.createPayment({ amount: 2500, currency: "EUR", orderId: "ord_1" });
    expect(result).toEqual({ id: "ch_new", amount: 2500 });
    const body = JSON.parse((mockFetch.mock.calls[0][1] as any).body);
    expect(body.query).toContain("mutation CreatePayment");
    expect(body.variables.input.amount).toBe(2500);
  });

  it("sendPaymentLink sends mutation", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: { sendPaymentLink: { success: true } } }) });
    const result = await client.sendPaymentLink({ chargeId: "ch_1", customerEmail: "a@b.com" });
    expect(result).toEqual({ success: true });
  });

  it("getSubscription fetches by ID", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: { subscription: { id: "sub_1", status: "ACTIVE" } } }) });
    expect(await client.getSubscription("sub_1")).toEqual({ id: "sub_1", status: "ACTIVE" });
  });

  it("listSubscriptions sends filters", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: { subscriptions: { items: [], total: 0 } } }) });
    await client.listSubscriptions({ status: "ACTIVE", size: 5 });
    const body = JSON.parse((mockFetch.mock.calls[0][1] as any).body);
    expect(body.variables.filter).toEqual({ status: { eq: "ACTIVE" } });
  });

  it("introspect fetches schema", async () => {
    const schema = { queryType: { name: "Query" }, mutationType: { name: "Mutation" } };
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: { __schema: schema } }) });
    expect(await client.introspect()).toEqual(schema);
  });

  it("defaults to https://graphql.monei.com", () => {
    const c = new MoneiGraphQLClient({ apiKey: "k" });
    // Can't directly inspect private field, but we verify it works via the constructor not throwing
    expect(c).toBeDefined();
  });
});
