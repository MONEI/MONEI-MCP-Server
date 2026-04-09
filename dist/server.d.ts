/**
 * MONEI MCP Server — Server Setup
 *
 * Uses the low-level MCP Server class to register tools with raw JSON schemas.
 * All operations go through MONEI's GraphQL API (https://graphql.monei.com).
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import type { ServerConfig } from "./types/index.js";
export declare function createMcpServer(config: ServerConfig, apiKey?: string): Server;
//# sourceMappingURL=server.d.ts.map