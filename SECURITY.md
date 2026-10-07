# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

**Email:** [security@monei.com](mailto:security@monei.com)

Please **do not** open a public issue for security vulnerabilities. We will respond within 48 hours and coordinate a fix before any public disclosure.

## Security Architecture

The MONEI MCP Server is designed with defense-in-depth for financial operations:

### Restricted Operations
Refunds, charges, payouts, subscription cancellations, and account modifications are **hard-blocked at the server level**. Even manually crafted tool calls are rejected with a clear message pointing to the [MONEI Dashboard](https://dashboard.monei.com). This is not configurable — it's enforced in code.

### Authentication
- **OAuth 2.0 + PKCE** (RFC 7636) — Proof Key for Code Exchange prevents authorization code interception
- **Single-use state tokens** — CSRF protection via time-limited, one-use OAuth state parameters
- **Scoped access** — OAuth tokens are limited to read + payment-link-creation scopes only
- **API key isolation** — Keys are server-side only, never exposed in tool responses

### Transport Security
- **Streamable HTTP** — Modern MCP transport with per-request isolation
- **HTTPS enforced** — Production server at `mcp.monei.com` is TLS-only
- **Security headers** — HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy
- **Body size limits** — Requests over 512KB are rejected

### Monitoring
- **Rate limiting** — Per-account sliding window (60 req/min) prevents abuse
- **Audit logging** — Every tool call logged with timestamp, account ID, tool name, duration, and sanitized parameters
- **Weekly schema checks** — CI automatically detects new GraphQL operations and flags them for review

## Supported Versions

| Version | Status |
|---------|--------|
| 0.2.x   | ✅ Active development |
| 0.1.x   | ⚠️ Deprecated — uses non-existent REST endpoints |

## Compliance

MONEI Digital Payments, S.L. is a Payment Institution regulated by [Banco de España](https://www.bde.es) (license #6911), PCI DSS Level 1 certified, and a member of Servired and the European Payments Council (SRTP group).
