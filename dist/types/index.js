/**
 * MONEI MCP Server — Shared Types
 */
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
];
export const RESTRICTION_REASONS = {
    refund_payment: "Refunds involve financial risk and must be performed through the MONEI Dashboard (dashboard.monei.com) with explicit merchant action.",
    charge_card: "Initiating card charges requires full PCI compliance context and cardholder consent flows that cannot be handled through an AI assistant.",
    charge_bizum: "Bizum charges require direct consumer authorization flows that must be initiated through proper payment channels.",
    card_payout: "Card payouts involve funds disbursement and require compliance controls beyond the scope of AI assistant operations.",
    bizum_payout: "Bizum payouts involve outbound money movement and require compliance controls beyond the scope of AI assistant operations.",
    delete_subscription: "Subscription deletion is a destructive action and must be performed through the MONEI Dashboard.",
    cancel_subscription: "Subscription cancellation is a destructive action and must be performed through the MONEI Dashboard.",
    modify_account_settings: "Account settings modification is security-sensitive and must be performed through the MONEI Dashboard.",
};
//# sourceMappingURL=index.js.map