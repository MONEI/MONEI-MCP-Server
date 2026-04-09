export const accountToolDefinitions = [
    {
        name: "get_account_info",
        description: "Get merchant account information including business details, enabled payment methods, status, and default currency.",
        inputSchema: { type: "object", properties: {} },
        annotations: { title: "Get Account Info", readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
];
export async function handleAccountTool(toolName, _args, client) {
    if (toolName === "get_account_info")
        return client.getAccount();
    throw new Error(`Unknown account tool: ${toolName}`);
}
//# sourceMappingURL=account.js.map