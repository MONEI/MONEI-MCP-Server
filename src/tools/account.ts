/**
 * Account Tools
 *
 * MCP tools for account operations (READ-ONLY):
 * ✅ get_account_info — Retrieve merchant account details
 */

// ─── Tool Definitions ────────────────────────────────────────

export const getAccountInfoTool = {
  name: "get_account_info",
  description:
    "Retrieve your MONEI merchant account information including business name, supported payment methods, and account configuration.",
  inputSchema: {
    type: "object" as const,
    properties: {},
  },
};
