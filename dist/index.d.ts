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
declare const app: import("express-serve-static-core").Express;
export default app;
//# sourceMappingURL=index.d.ts.map