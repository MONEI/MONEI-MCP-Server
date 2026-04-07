/**
 * Input Validation Tests
 *
 * Verifies that Zod schemas reject malformed or malicious inputs
 * before they ever reach the API client.
 */

import { describe, it, expect } from "vitest";
import {
  GeneratePaymentLinkInput,
  GetPaymentInput,
  ListPaymentsInput,
} from "../../src/tools/payments.js";
import {
  GetSubscriptionInput,
  ListSubscriptionsInput,
} from "../../src/tools/subscriptions.js";

describe("GeneratePaymentLinkInput", () => {
  it("accepts valid input", () => {
    const result = GeneratePaymentLinkInput.parse({
      amount: 1050,
      currency: "EUR",
      description: "Coffee subscription",
    });
    expect(result.amount).toBe(1050);
    expect(result.currency).toBe("EUR");
  });

  it("defaults currency to EUR", () => {
    const result = GeneratePaymentLinkInput.parse({ amount: 100 });
    expect(result.currency).toBe("EUR");
  });

  it("rejects negative amount", () => {
    expect(() =>
      GeneratePaymentLinkInput.parse({ amount: -100, currency: "EUR" })
    ).toThrow();
  });

  it("rejects zero amount", () => {
    expect(() =>
      GeneratePaymentLinkInput.parse({ amount: 0, currency: "EUR" })
    ).toThrow();
  });

  it("rejects float amount (must be integer/cents)", () => {
    expect(() =>
      GeneratePaymentLinkInput.parse({ amount: 10.50, currency: "EUR" })
    ).toThrow();
  });

  it("rejects invalid currency length", () => {
    expect(() =>
      GeneratePaymentLinkInput.parse({ amount: 100, currency: "E" })
    ).toThrow();
    expect(() =>
      GeneratePaymentLinkInput.parse({ amount: 100, currency: "EURO" })
    ).toThrow();
  });

  it("rejects invalid email", () => {
    expect(() =>
      GeneratePaymentLinkInput.parse({
        amount: 100,
        currency: "EUR",
        customerEmail: "not-an-email",
      })
    ).toThrow();
  });

  it("accepts valid email", () => {
    const result = GeneratePaymentLinkInput.parse({
      amount: 100,
      currency: "EUR",
      customerEmail: "test@example.com",
    });
    expect(result.customerEmail).toBe("test@example.com");
  });

  it("rejects missing amount", () => {
    expect(() =>
      GeneratePaymentLinkInput.parse({ currency: "EUR" })
    ).toThrow();
  });
});

describe("GetPaymentInput", () => {
  it("accepts valid payment ID", () => {
    const result = GetPaymentInput.parse({ paymentId: "pay_abc123" });
    expect(result.paymentId).toBe("pay_abc123");
  });

  it("rejects empty payment ID", () => {
    expect(() => GetPaymentInput.parse({ paymentId: "" })).toThrow();
  });

  it("rejects missing payment ID", () => {
    expect(() => GetPaymentInput.parse({})).toThrow();
  });
});

describe("ListPaymentsInput", () => {
  it("provides sensible defaults", () => {
    const result = ListPaymentsInput.parse({});
    expect(result.limit).toBe(10);
    expect(result.offset).toBe(0);
  });

  it("rejects limit > 100", () => {
    expect(() => ListPaymentsInput.parse({ limit: 500 })).toThrow();
  });

  it("rejects limit < 1", () => {
    expect(() => ListPaymentsInput.parse({ limit: 0 })).toThrow();
  });

  it("rejects negative offset", () => {
    expect(() => ListPaymentsInput.parse({ offset: -1 })).toThrow();
  });
});

describe("GetSubscriptionInput", () => {
  it("accepts valid subscription ID", () => {
    const result = GetSubscriptionInput.parse({ subscriptionId: "sub_xyz" });
    expect(result.subscriptionId).toBe("sub_xyz");
  });

  it("rejects empty subscription ID", () => {
    expect(() => GetSubscriptionInput.parse({ subscriptionId: "" })).toThrow();
  });
});

describe("ListSubscriptionsInput", () => {
  it("provides sensible defaults", () => {
    const result = ListSubscriptionsInput.parse({});
    expect(result.limit).toBe(10);
    expect(result.offset).toBe(0);
  });

  it("rejects limit > 100", () => {
    expect(() => ListSubscriptionsInput.parse({ limit: 200 })).toThrow();
  });
});
