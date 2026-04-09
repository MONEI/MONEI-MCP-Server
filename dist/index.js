#!/usr/bin/env node
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";
import { createMcpServer } from "./server.js";
import { getAuthorizationUrl, exchangeCodeForTokens } from "./auth/oauth.js";
import { generateState } from "./auth/pkce.js";
import { createState, validateAndConsumeState, cleanupExpiredStates } from "./auth/session.js";
import { corsHeaders, securityHeaders, bodySizeGuard } from "./middleware/security.js";
const config = {
    port: parseInt(process.env.PORT ?? "3000", 10),
    host: process.env.HOST ?? "0.0.0.0",
    moneiGraphqlEndpoint: process.env.MONEI_GRAPHQL_ENDPOINT ?? "https://graphql.monei.com",
    oauth: {
        clientId: process.env.MONEI_CLIENT_ID ?? "",
        clientSecret: process.env.MONEI_CLIENT_SECRET ?? "",
        redirectUri: process.env.MONEI_REDIRECT_URI ?? `http://localhost:${process.env.PORT ?? "3000"}/oauth/callback`,
    },
};
const app = express();
app.use(corsHeaders);
app.use(securityHeaders);
app.use(express.json());
app.use(bodySizeGuard());
app.options("*", (_req, res) => { res.status(204).end(); });
const sseTransports = new Map();
app.get("/health", (_req, res) => {
    res.json({ status: "ok", server: "MONEI MCP Server", version: "0.2.0", transport: ["streamable-http", "sse"], graphqlEndpoint: config.moneiGraphqlEndpoint, timestamp: new Date().toISOString() });
});
app.post("/mcp", async (req, res) => {
    const server = createMcpServer(config);
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    await server.connect(transport);
    await transport.handleRequest(req, res);
});
app.get("/sse", async (_req, res) => {
    const server = createMcpServer(config);
    const transport = new SSEServerTransport("/messages", res);
    sseTransports.set(transport.sessionId, transport);
    res.on("close", () => { sseTransports.delete(transport.sessionId); });
    await server.connect(transport);
});
app.post("/messages", async (req, res) => {
    const transport = sseTransports.get(req.query.sessionId);
    if (!transport) {
        res.status(404).json({ error: "Session not found" });
        return;
    }
    await transport.handlePostMessage(req, res);
});
app.get("/oauth/authorize", (_req, res) => {
    const state = generateState();
    createState(state);
    res.redirect(getAuthorizationUrl(config, state));
});
app.get("/oauth/callback", async (req, res) => {
    const { code, state, error } = req.query;
    if (error) {
        res.status(400).json({ error: "OAuth authorization denied", details: error });
        return;
    }
    if (!code || typeof code !== "string" || !state || typeof state !== "string") {
        res.status(400).json({ error: "Missing code or state" });
        return;
    }
    if (!validateAndConsumeState(state)) {
        res.status(400).json({ error: "Invalid or expired OAuth state" });
        return;
    }
    try {
        const tokens = await exchangeCodeForTokens(config, code, state);
        res.json({ success: true, message: "MONEI account connected!", accountId: tokens.accountId, scope: tokens.scope });
    }
    catch (err) {
        res.status(500).json({ error: "Token exchange failed", details: err instanceof Error ? err.message : String(err) });
    }
});
setInterval(cleanupExpiredStates, 5 * 60 * 1000);
app.listen(config.port, config.host, () => {
    console.log(`\n  MONEI MCP Server v0.2.0\n  Streamable HTTP: http://${config.host}:${config.port}/mcp\n  SSE: http://${config.host}:${config.port}/sse\n  Health: http://${config.host}:${config.port}/health\n  GraphQL: ${config.moneiGraphqlEndpoint}\n`);
});
export { app, config };
//# sourceMappingURL=index.js.map