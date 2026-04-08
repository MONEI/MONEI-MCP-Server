import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { TOOL_DEFINITIONS, handleToolCall } from "./tools/index.js";
import { MoneiApiClient } from "./api/monei-client.js";
import { checkRateLimit } from "./middleware/rate-limiter.js";
import { createAuditContext } from "./middleware/audit-logger.js";
export function createMcpServer(config) {
    const server = new McpServer({
        name: "MONEI",
        version: "0.1.0",
        description: "Connect your MONEI account to manage payments, generate payment links, and view transaction history through AI assistants.",
    });
    for (const tool of TOOL_DEFINITIONS) {
        // Convert JSON Schema properties to a Zod shape for the SDK
        const zodShape = {};
        const props = tool.inputSchema.properties ?? {};
        const required = new Set("required" in tool.inputSchema
            ? tool.inputSchema.required ?? []
            : []);
        for (const [key, prop] of Object.entries(props)) {
            let field;
            if (prop.type === "number") {
                field = z.number().describe(prop.description ?? "");
            }
            else {
                field = z.string().describe(prop.description ?? "");
            }
            zodShape[key] = required.has(key) ? field : field.optional();
        }
        const annotations = "annotations" in tool ? tool.annotations : {};
        const title = "title" in tool ? tool.title : tool.name;
        server.tool(tool.name, tool.description, { ...zodShape }, { ...annotations, title }, async (args, extra) => {
            const accountId = "unknown";
            const rateCheck = checkRateLimit(accountId);
            if (!rateCheck.allowed) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `Rate limit exceeded. Resets at: ${new Date(rateCheck.resetAt).toISOString()}`,
                        },
                    ],
                    isError: true,
                };
            }
            const audit = createAuditContext(accountId, tool.name);
            const accessToken = process.env.MONEI_API_KEY ?? "";
            const apiClient = new MoneiApiClient(accessToken, config.moneiApiBaseUrl);
            try {
                const result = await handleToolCall(tool.name, args, apiClient);
                audit.success(args);
                return result;
            }
            catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                audit.failure(args, message);
                return {
                    content: [{ type: "text", text: `Error: ${message}` }],
                    isError: true,
                };
            }
        });
    }
    server.prompt("monei-assistant", "System prompt context for AI assistants connected to MONEI", () => ({
        messages: [
            {
                role: "user",
                content: {
                    type: "text",
                    text: [
                        "You are connected to the merchant's MONEI payment account.",
                        "",
                        "You CAN help the merchant with:",
                        "- Creating payment links to share with customers",
                        "- Looking up payment details and status",
                        "- Searching and filtering transaction history",
                        "- Viewing subscription details",
                        "- Checking account information",
                        "",
                        "You CANNOT and must NEVER attempt to:",
                        "- Process refunds (must use MONEI Dashboard)",
                        "- Charge cards or Bizum directly",
                        "- Send payouts (card or Bizum)",
                        "- Cancel or delete subscriptions",
                        "- Modify account settings",
                        "",
                        "If a merchant asks for a restricted action, politely explain",
                        "that it must be done through the MONEI Dashboard at",
                        "https://dashboard.monei.com for security reasons.",
                        "",
                        "Payment amounts are in cents (smallest currency unit).",
                        "For example, €10.50 = 1050.",
                    ].join("\n"),
                },
            },
        ],
    }));
    return server;
}
//# sourceMappingURL=server.js.map