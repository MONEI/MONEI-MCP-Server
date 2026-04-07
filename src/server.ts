/**
 * MONEI MCP Server
 *
 * Model Context Protocol server that exposes safe MONEI payment
 * operations to AI assistants (Claude, ChatGPT) via OAuth 2.0.
 *
 * Architecture:
 *  - HTTP + SSE transport (remote MCP server)
 *  - OAuth 2.0 for merchant authentication
 *  - Scoped tools: payment links, read-only queries
 *  - Hard-blocked: refunds, charges, payouts
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { TOOL_DEFINITIONS, handleToolCall } from "./tools/index.js";
import { MoneiApiClient } from "./api/monei-client.js";
import { checkRateLimit } from "./middleware/rate-limiter.js";
import { createAuditContext } from "./middleware/audit-logger.js";
import type { ServerConfig } from "./types/index.js";

export function createMcpServer(config: ServerConfig): McpServer {
  const server = new McpServer({
    name: "MONEI",
    version: "0.1.0",
    description:
      "Connect your MONEI account to manage payments, generate payment links, and view transaction history through AI assistants.",
  });

  // ─── Register Tools ──────────────────────────────────────

  for (const tool of TOOL_DEFINITIONS) {
    server.tool(
      tool.name,
      tool.description,
      tool.inputSchema,
      async (args: Record<string, unknown>, extra) => {
        // TODO: Extract accountId from OAuth session/token in `extra`
        // For now, use a placeholder. In production, this comes from
        // the authenticated OAuth session context.
        const accountId = (extra as Record<string, string>).accountId ?? "unknown";

        // Rate limiting
        const rateCheck = checkRateLimit(accountId);
        if (!rateCheck.allowed) {
          return {
            content: [
              {
                type: "text" as const,
                text: `Rate limit exceeded. Please wait before making more requests. Resets at: ${new Date(rateCheck.resetAt).toISOString()}`,
              },
            ],
            isError: true,
          };
        }

        // Audit context
        const audit = createAuditContext(accountId, tool.name);

        // TODO: Get access token from OAuth session (extra.authInfo)
        // For now, fall back to env var for development
        const accessToken =
          (extra as Record<string, string>).accessToken ??
          process.env.MONEI_API_KEY ??
          "";

        const apiClient = new MoneiApiClient(accessToken, config.moneiApiBaseUrl);

        try {
          const result = await handleToolCall(tool.name, args, apiClient);
          audit.success(args);
          return result;
        } catch (error) {
          const message =
            error instanceof Error ? error.message : String(error);
          audit.failure(args, message);
          return {
            content: [{ type: "text" as const, text: `Error: ${message}` }],
            isError: true,
          };
        }
      }
    );
  }

  // ─── Server Metadata / Prompts ───────────────────────────

  server.prompt(
    "monei-assistant",
    "System prompt context for AI assistants connected to MONEI",
    () => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
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
    })
  );

  return server;
}
