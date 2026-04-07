# MONEI MCP Server

Connect your [MONEI](https://monei.com) payment account to AI assistants like [Claude](https://claude.ai) and ChatGPT using the [Model Context Protocol](https://modelcontextprotocol.io).

Generate payment links, check transaction status, and browse your payment history — all through natural language conversation.

## Features

- **🔗 Payment Links** — Create and share payment links with customers via AI
- **🔍 Transaction Lookup** — Get payment details and status by ID
- **📊 Payment History** — Search and filter your transaction history
- **📋 Subscriptions** — View subscription details and status
- **🏢 Account Info** — Access your merchant account configuration
- **🔐 OAuth 2.0** — Secure merchant authentication with scoped permissions
- **🛡️ Guardrails** — Restricted operations are hard-blocked, not just hidden

## Security by Design

This server enforces strict guardrails on what operations AI assistants can perform. The following operations are **explicitly blocked** at the server level:

| Blocked Operation | Reason |
|---|---|
| Refund payments | Financial risk — use [MONEI Dashboard](https://dashboard.monei.com) |
| Charge cards/Bizum | Requires PCI context and cardholder consent flows |
| Card payouts | Funds disbursement requires compliance controls |
| Bizum payouts | Outbound money movement requires compliance controls |
| Cancel subscriptions | Destructive action — use Dashboard |
| Modify account settings | Security-sensitive — use Dashboard |

Even if a tool call is crafted manually, restricted endpoints will reject it with a clear explanation and redirect to the Dashboard.

## Quick Start

### Prerequisites

- Node.js 18+
- A [MONEI account](https://dashboard.monei.com) with API credentials

### Installation

```bash
git clone https://github.com/MONEI/MONEI-MCP-Server.git
cd MONEI-MCP-Server
npm install
```

### Configuration

```bash
cp .env.example .env
```

Edit `.env` with your MONEI credentials:

```env
MONEI_CLIENT_ID=your_client_id
MONEI_CLIENT_SECRET=your_client_secret
MONEI_API_KEY=your_api_key  # For development/testing
```

### Run

```bash
# Development (with hot reload)
npm run dev

# Production
npm run build
npm start
```

The server starts at `http://localhost:3000` with:

- **Streamable HTTP (recommended):** `/mcp` — Connect AI assistants here
- **Legacy SSE:** `/sse` — Backward compatibility
- **Health check:** `/health` — Server status
- **OAuth:** `/oauth/authorize` — Merchant authorization flow

## Connecting to Claude

### Claude.ai (Connectors Directory)

Once listed in the Anthropic Connectors Directory, merchants can connect with one click from **Customize → Connectors** in Claude.ai.

For custom connector setup:

1. Go to **Customize → Connectors → Add**
2. Add your server URL: `https://your-domain.com/mcp`
3. Complete the OAuth authorization flow

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "monei": {
      "url": "https://your-domain.com/mcp"
    }
  }
}
```

### Claude Code

```bash
claude mcp add monei --transport http https://your-domain.com/mcp
```

## Available Tools

### `generate_payment_link`

Create a shareable payment URL.

```
"Generate a €25 payment link for order #1234 — customer is alex@example.com"
```

### `get_payment`

Retrieve payment details by ID.

```
"What's the status of payment abc123?"
```

### `list_payments`

Search and filter transaction history.

```
"Show me all successful payments from last week"
```

### `get_subscription`

View subscription details.

```
"Get the details of subscription sub_xyz"
```

### `list_subscriptions`

Browse subscriptions.

```
"List all active subscriptions"
```

### `get_account_info`

View merchant account details.

```
"What payment methods do I have enabled?"
```

## Architecture

```
src/
├── index.ts              # Entry point — Streamable HTTP + SSE + OAuth routes
├── server.ts             # MCP server setup + tool registration
├── auth/
│   ├── oauth.ts          # OAuth 2.0 + PKCE + scope validation
│   ├── pkce.ts           # RFC 7636 PKCE implementation
│   └── session.ts        # Single-use OAuth state manager (CSRF protection)
├── api/
│   └── monei-client.ts   # MONEI REST API client (allowed ops only)
├── tools/
│   ├── index.ts          # Tool registry + routing + restriction enforcement
│   ├── payments.ts       # Payment tools with safety annotations
│   ├── subscriptions.ts  # Subscription tools with safety annotations
│   └── account.ts        # Account info tool with safety annotations
├── middleware/
│   ├── security.ts       # CORS, HTTPS, session validation, input guard
│   ├── rate-limiter.ts   # Per-account sliding window rate limiter
│   └── audit-logger.ts   # Structured JSON audit logging
└── types/
    └── index.ts          # Shared types + restricted operations registry

tests/
├── auth/                 # PKCE, session, scope validation tests
├── middleware/            # Rate limiter, audit logger, security tests
└── tools/                # Restriction enforcement, routing, validation tests
```

## Roadmap

- [x] Streamable HTTP transport (Anthropic directory requirement)
- [x] Tool safety annotations (readOnlyHint / destructiveHint)
- [x] PKCE (RFC 7636) + CSRF state validation
- [x] Security hardening (Helmet, CORS, rate limiting, audit logging)
- [x] Comprehensive test suite
- [ ] Production OAuth 2.0 integration with MONEI auth service
- [ ] Persistent token storage (Redis/PostgreSQL)
- [ ] Anthropic Connectors Directory submission
- [ ] Webhook notifications for payment status changes
- [ ] Docker container + deploy-to-cloud templates
- [ ] NPM package publishing (`npx @monei/mcp-server`)
- [ ] Claude Desktop Extension (.mcpb bundle)

## API Documentation

- [MONEI API Reference](https://docs.monei.com/api)
- [MONEI Postman Collection](https://postman.monei.com)
- [MCP Specification](https://modelcontextprotocol.io)

## License

MIT © [MONEI](https://monei.com)
