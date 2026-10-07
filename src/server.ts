/**
 * MONEI MCP Server — Server Setup
 *
 * Uses the low-level MCP Server class to register tools with raw JSON schemas.
 * All operations go through MONEI's GraphQL API (https://graphql.monei.com).
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { MoneiGraphQLClient } from "./api/monei-client.js";
import { ALL_TOOL_DEFINITIONS, handleToolCall } from "./tools/index.js";
import type { ServerConfig } from "./types/index.js";

export function createMcpServer(config: ServerConfig, apiKey?: string): Server {
  const server = new Server(
    {
      name: "MONEI",
      version: "0.2.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // ─── List Tools ─────────────────────────────────────────

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: ALL_TOOL_DEFINITIONS.map((tool) => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
      annotations: tool.annotations,
    })),
  }));

  // ─── Call Tool ──────────────────────────────────────────

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    // Resolve API key — from OAuth in production, env var for dev
    const resolvedKey = apiKey || process.env.MONEI_API_KEY || "";

    if (!resolvedKey) {
      return {
        content: [
          {
            type: "text" as const,
            text: "No MONEI API key configured. Please connect your MONEI account via OAuth or set MONEI_API_KEY.",
          },
        ],
        isError: true,
      };
    }

    const client = new MoneiGraphQLClient({
      apiKey: resolvedKey,
      graphqlEndpoint: config.moneiGraphqlEndpoint,
    });

    return handleToolCall(name, args ?? {}, client);
  });

  return server;
}
