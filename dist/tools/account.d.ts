/**
 * Account Tools
 *
 * MCP tools for account operations (READ-ONLY):
 * ✅ get_account_info — Retrieve merchant account details
 */
export declare const getAccountInfoTool: {
    name: string;
    title: string;
    description: string;
    annotations: {
        readOnlyHint: boolean;
        destructiveHint: boolean;
        idempotentHint: boolean;
        openWorldHint: boolean;
    };
    inputSchema: {
        type: "object";
        properties: {};
    };
};
//# sourceMappingURL=account.d.ts.map