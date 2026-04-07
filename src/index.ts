#!/usr/bin/env node

/**
 * MONEI MCP Server — Entry Point
 *
 * Starts the MCP server with HTTP+SSE transport and full security stack:
 * - Helmet (security headers)
 * - CORS (strict origin allowlist)
 * - HTTPS enforcement (production)
 * - PKCE + state validation on OAuth
 * - Session validation on /messages
 * - Rate limiting + audit logging on tool calls
 * - Input guards (size, content-type)
 *
 * Usage:
 *   npm run dev      # Development with hot reload
 *   npm start        # Production
 */

import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express, { type Request, type Response } from "express";
import cors from "cors";
import helmet from "helmet";
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
  createSessionValidator,
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

// Store active SSE transports (used for session validation)
const transports = new Map<string, SSEServerTransport>();

// ─── Security Middleware Stack ──────────────────────────────

// 1. HTTPS enforcement in production
app.use(httpsEnforcement());

// 2. Helmet — secure HTTP headers (CSP, X-Frame-Options, etc.)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'none'"],
        connectSrc: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false, // Allow SSE connections
  })
);

// 3. CORS — strict origin allowlist
app.use(cors(getCorsOptions()));

// 4. JSON body parser with 1MB limit
app.use(express.json({ limit: "1mb" }));

// 5. Input guard — reject non-JSON POSTs
app.use(inputGuard());

// 6. Dev-mode API key check
app.use(requireApiKeyInDev());

// ─── Health Check ───────────────────────────────────────────

app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    server: "MONEI MCP Server",
    version: "0.1.0",
    timestamp: new Date().toISOString(),
    activeSessions: transports.size,
  });
});

// ─── MCP SSE Endpoint ───────────────────────────────────────

app.get("/sse", async (req: Request, res: Response) => {
  console.log("[MCP] New SSE connection");

  const server = createMcpServer(config);
  const transport = new SSEServerTransport("/messages", res);
  const sessionId = transport.sessionId;

  transports.set(sessionId, transport);

  res.on("close", () => {
    console.log(`[MCP] SSE connection closed: ${sessionId}`);
    transports.delete(sessionId);
  });

  await server.connect(transport);
});

// Session-validated /messages endpoint
app.post(
  "/messages",
  createSessionValidator(transports),
  async (req: Request, res: Response) => {
    const sessionId = req.query.sessionId as string;
    const transport = transports.get(sessionId)!;
    await transport.handlePostMessage(req, res);
  }
);

// ─── OAuth 2.0 Endpoints ───────────────────────────────────

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

    // In production, redirect to a success page instead of returning JSON
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
 * Revokes a merchant's OAuth connection.
 * Requires the accountId in the request body.
 */
app.post("/oauth/revoke", (req: Request, res: Response) => {
  const { accountId } = req.body as { accountId?: string };

  if (!accountId || typeof accountId !== "string") {
    res.status(400).json({ error: "Missing or invalid accountId" });
    return;
  }

  // TODO: Also call MONEI's token revocation endpoint
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
    hint: "MONEI MCP Server endpoints: /sse, /messages, /health, /oauth/authorize",
  });
});

// ─── Start Server ───────────────────────────────────────────

app.listen(config.port, config.host, () => {
  console.log("");
  console.log("  ╔══════════════════════════════════════╗");
  console.log("  ║       MONEI MCP Server v0.1.0        ║");
  console.log("  ╚══════════════════════════════════════╝");
  console.log("");
  console.log(`  → HTTP+SSE:  http://${config.host}:${config.port}/sse`);
  console.log(`  → Messages:  http://${config.host}:${config.port}/messages`);
  console.log(`  → Health:    http://${config.host}:${config.port}/health`);
  console.log(`  → OAuth:     http://${config.host}:${config.port}/oauth/authorize`);
  console.log("");
  console.log("  Security: Helmet ✓ | CORS ✓ | PKCE ✓ | Rate Limit ✓ | Audit ✓");
  console.log("");
});

export default app;
