/**
 * Account Tools
 *
 * MCP tools for account operations (READ-ONLY):
 * ✅ get_account_info — Retrieve merchant account details
 */
// ─── Tool Definitions ────────────────────────────────────────
export const getAccountInfoTool = {
    name: "get_account_info",
    title: "Get Account Info",
    description: "Retrieve your MONEI merchant account information including business name, supported payment methods, and account configuration.",
    annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
    },
    inputSchema: {
        type: "object",
        properties: {},
    },
};
//# sourceMappingURL=account.js.map