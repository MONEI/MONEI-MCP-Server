#!/usr/bin/env node

/**
 * MONEI MCP Server — Entry Point
 *
 * Supports both transport modes:
 *   1. Streamable HTTP on /mcp (recommended, required for Anthropic directory)
 *   2. SSE on /sse + /messages (backward compatibility)
 *
 * Security stack:
 *   Helmet · CORS · HTTPS enforcement · PKCE · Session validation
 *   Rate limiting · Audit logging · Input guards
 */

import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import express, { type Request, type Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { randomUUID } from "node:crypto";
import { createMcpServer } from "./server.js";
import {
  getAuthorizationUrl,
  exchangeCodeForTokens,
  revokeTokens,
  OAuthError,
} from "./auth/oauth.js";
import {
  getCorsOptions,
  httpsEnforcement,
  inputGuard,
  requireApiKeyInDev,
} from "./middleware/security.js";
import type { ServerConfig } from "./types/index.js";

// ─── Configuration ──────────────────────────────────────────

const config: ServerConfig = {
  port: parseInt(process.env.PORT ?? "3000", 10),
  host: process.env.HOST ?? "0.0.0.0",
  moneiApiBaseUrl:
    process.env.MONEI_API_BASE_URL ?? "https://api.monei.com/v1",
  oauth: {
    clientId: process.env.MONEI_CLIENT_ID ?? "",
    clientSecret: process.env.MONEI_CLIENT_SECRET ?? "",
    redirectUri:
      process.env.MONEI_REDIRECT_URI ??
      `http://localhost:${process.env.PORT ?? "3000"}/oauth/callback`,
  },
};

// ─── Express App ────────────────────────────────────────────

const app = express();

// ─── Security Middleware Stack ──────────────────────────────

app.use(httpsEnforcement());

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'none'"],
        connectSrc: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

app.use(cors(getCorsOptions()));
app.use(express.json({ limit: "1mb" }));
app.use(inputGuard());
app.use(requireApiKeyInDev());

// ─── Transport Stores ──────────────────────────────────────

// Streamable HTTP sessions (primary)
const streamableTransports = new Map<string, StreamableHTTPServerTransport>();

// Legacy SSE sessions (backward compat)
const sseTransports = new Map<string, SSEServerTransport>();

// ─── Health Check ───────────────────────────────────────────

app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    server: "MONEI MCP Server",
    version: "0.1.0",
    timestamp: new Date().toISOString(),
    transports: {
      streamableHttp: streamableTransports.size,
      sse: sseTransports.size,
    },
  });
});

// ═══════════════════════════════════════════════════════════════
//  STREAMABLE HTTP TRANSPORT — /mcp (Primary, Anthropic Directory)
// ═══════════════════════════════════════════════════════════════

app.post("/mcp", async (req: Request, res: Response) => {
  const sessionId = req.headers["mcp-session-id"] as string | undefined;

  // Reuse existing session
  if (sessionId && streamableTransports.has(sessionId)) {
    const transport = streamableTransports.get(sessionId)!;
    await transport.handleRequest(req, res, req.body);
    return;
  }

  // New session — only on initialize request
  if (!sessionId && isInitializeRequest(req.body)) {
    const server = createMcpServer(config);
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
    });

    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);

    // Store transport after first request (session ID now available)
    const newSessionId = transport.sessionId;
    if (newSessionId) {
      streamableTransports.set(newSessionId, transport);
      console.log(`[MCP/HTTP] New session: ${newSessionId}`);
    }
    return;
  }

  // Invalid request
  res.status(400).json({
    error: "Bad Request",
    message: sessionId
      ? "Unknown session. It may have expired."
      : "First request must be an initialize request.",
  });
});

// GET /mcp — Server-to-client SSE stream (notifications)
app.get("/mcp", async (req: Request, res: Response) => {
  const sessionId = req.headers["mcp-session-id"] as string | undefined;

  if (!sessionId || !streamableTransports.has(sessionId)) {
    res.status(400).json({ error: "Invalid or missing session ID" });
    return;
  }

  const transport = streamableTransports.get(sessionId)!;
  await transport.handleRequest(req, res);
});

// DELETE /mcp — Session termination
app.delete("/mcp", async (req: Request, res: Response) => {
  const sessionId = req.headers["mcp-session-id"] as string | undefined;

  if (!sessionId || !streamableTransports.has(sessionId)) {
    res.status(404).json({ error: "Session not found" });
    return;
  }

  streamableTransports.delete(sessionId);
  console.log(`[MCP/HTTP] Session terminated: ${sessionId}`);
  res.status(204).end();
});

// ═══════════════════════════════════════════════════════════════
//  LEGACY SSE TRANSPORT — /sse + /messages (Backward Compat)
// ═══════════════════════════════════════════════════════════════

app.get("/sse", async (req: Request, res: Response) => {
  console.log("[MCP/SSE] New SSE connection");

  const server = createMcpServer(config);
  const transport = new SSEServerTransport("/messages", res);
  const sessionId = transport.sessionId;

  sseTransports.set(sessionId, transport);

  res.on("close", () => {
    console.log(`[MCP/SSE] Connection closed: ${sessionId}`);
    sseTransports.delete(sessionId);
  });

  await server.connect(transport);
});

app.post("/messages", async (req: Request, res: Response) => {
  const sessionId = req.query.sessionId as string;

  if (!sessionId || !sseTransports.has(sessionId)) {
    res.status(401).json({
      error: "Invalid or expired session",
      hint: "Connect via /sse or /mcp first.",
    });
    return;
  }

  const transport = sseTransports.get(sessionId)!;
  await transport.handlePostMessage(req, res);
});

// ═══════════════════════════════════════════════════════════════
//  OAUTH 2.0 ENDPOINTS
// ═══════════════════════════════════════════════════════════════

/**
 * GET /oauth/authorize
 * Redirects merchant to MONEI's OAuth consent screen.
 * Generates PKCE challenge + CSRF state automatically.
 */
app.get("/oauth/authorize", (_req: Request, res: Response) => {
  const { url } = getAuthorizationUrl(config);
  res.redirect(url);
});

/**
 * GET /oauth/callback
 * Handles the OAuth callback. Validates state (CSRF) and
 * exchanges code + PKCE verifier for scoped tokens.
 *
 * Registered callback URLs:
 *   - https://claude.ai/api/mcp/auth_callback
 *   - https://claude.com/api/mcp/auth_callback
 *   - http://localhost:6274/oauth/callback (Claude Code / MCP Inspector)
 *   - http://localhost:{PORT}/oauth/callback (development)
 */
app.get("/oauth/callback", async (req: Request, res: Response) => {
  const { code, state, error, error_description } = req.query;

  if (error) {
    console.warn(`[OAuth] Authorization denied: ${error} — ${error_description}`);
    res.status(400).json({
      error: "OAuth authorization denied",
      details: error_description ?? error,
    });
    return;
  }

  if (!code || typeof code !== "string") {
    res.status(400).json({ error: "Missing authorization code" });
    return;
  }

  if (!state || typeof state !== "string") {
    res.status(400).json({ error: "Missing state parameter" });
    return;
  }

  try {
    const tokens = await exchangeCodeForTokens(config, code, state);

    res.json({
      success: true,
      message:
        "MONEI account connected successfully! You can now use AI assistants with your MONEI account.",
      accountId: tokens.accountId,
      scope: tokens.scope,
    });
  } catch (err) {
    if (err instanceof OAuthError) {
      console.error(`[OAuth] ${err.code}: ${err.message}`);
      const status = err.code === "invalid_state" ? 403 : 500;
      res.status(status).json({
        error: err.code,
        message: err.message,
      });
      return;
    }

    const message = err instanceof Error ? err.message : String(err);
    console.error("[OAuth] Token exchange failed:", message);
    res.status(500).json({
      error: "token_exchange_failed",
      message: "Failed to connect MONEI account. Please try again.",
    });
  }
});

/**
 * POST /oauth/revoke
 */
app.post("/oauth/revoke", (req: Request, res: Response) => {
  const { accountId } = req.body as { accountId?: string };

  if (!accountId || typeof accountId !== "string") {
    res.status(400).json({ error: "Missing or invalid accountId" });
    return;
  }

  const revoked = revokeTokens(accountId);

  if (!revoked) {
    res.status(404).json({ error: "No active connection for this account" });
    return;
  }

  console.log(`[OAuth] Revoked tokens for account: ${accountId}`);
  res.json({
    success: true,
    message: "MONEI account disconnected successfully.",
  });
});

// ─── 404 Catch-All ──────────────────────────────────────────

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: "Not found",
    hint: "MONEI MCP Server endpoints: /mcp (recommended), /sse (legacy), /health, /oauth/authorize",
  });
});

// ─── Start Server ───────────────────────────────────────────

app.listen(config.port, config.host, () => {
  console.log("");
  console.log("  ╔══════════════════════════════════════╗");
  console.log("  ║       MONEI MCP Server v0.1.0        ║");
  console.log("  ╚══════════════════════════════════════╝");
  console.log("");
  console.log(`  Streamable HTTP (recommended):`);
  console.log(`    → POST/GET/DELETE http://${config.host}:${config.port}/mcp`);
  console.log("");
  console.log(`  Legacy SSE (backward compat):`);
  console.log(`    → GET  http://${config.host}:${config.port}/sse`);
  console.log(`    → POST http://${config.host}:${config.port}/messages`);
  console.log("");
  console.log(`  Other:`);
  console.log(`    → Health:  http://${config.host}:${config.port}/health`);
  console.log(`    → OAuth:   http://${config.host}:${config.port}/oauth/authorize`);
  console.log("");
  console.log("  Security: Helmet ✓ | CORS ✓ | PKCE ✓ | Rate Limit ✓ | Audit ✓");
  console.log("");
});

export default app;
