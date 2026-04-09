# MONEI MCP Server

[![CI](https://github.com/MONEI/MONEI-MCP-Server/actions/workflows/ci.yml/badge.svg)](https://github.com/MONEI/MONEI-MCP-Server/actions/workflows/ci.yml)
[![Schema Check](https://github.com/MONEI/MONEI-MCP-Server/actions/workflows/schema-check.yml/badge.svg)](https://github.com/MONEI/MONEI-MCP-Server/actions/workflows/schema-check.yml)
[![Live](https://img.shields.io/badge/Live-mcp.monei.com-00D4AA)](https://mcp.monei.com/health)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js)](https://nodejs.org/)
[![MCP](https://img.shields.io/badge/MCP-Streamable_HTTP-8B5CF6)](https://modelcontextprotocol.io)

**The first European payment platform with native AI agent support.**

Connect your [MONEI](https://monei.com) account to [Claude](https://claude.ai), [ChatGPT](https://chatgpt.com), or any [MCP](https://modelcontextprotocol.io)-compatible AI assistant. Generate payment links, check transactions, view analytics — all through natural language.

> Regulated by [Banco de España](https://www.bde.es) (#6911) · PCI DSS Level 1 · [Bizum](https://bizum.es) Direct Acquirer · [GraphQL Native](https://docs.monei.com/apis/graphql/)

```
MCP Server URL: https://mcp.monei.com/mcp
```

[Quick Start](#quick-start) · [Available Tools](#available-tools) · [Security](#security-by-design) · [API Docs](https://docs.monei.com/apis/graphql/)

---

## Demo

```
You:    "Generate a €25 payment link for order #1234 — customer is alex@example.com"

Claude: ✅ Payment link created!
        Amount: €25.00
        Link: https://pay.monei.com/ch_abc123
        Status: PENDING
        Customer: alex@example.com

You:    "What's my revenue this week?"

Claude: 📊 This week's KPIs (Apr 1–7):
        Total: €12,450.00 (142 transactions)
        Success rate: 96.5%
        Average: €87.68

You:    "Refund the last payment"

Claude: ⛔ Refunds are not available through AI assistants for security reasons.
        Please use the MONEI Dashboard: https://dashboard.monei.com
```

## Why MONEI?

If you're comparing MCP payment servers:

| | MONEI | Stripe | Square |
|---|---|---|---|
| **European payment rails** | Bizum, Servired, SEPA, Cofidis, MB WAY | Limited EU methods | US-focused |
| **Regulation** | Banco de España PI (#6911) | EMI (Ireland) | EMI (Luxembourg) |
| **API** | GraphQL native (AppSync) | REST | REST |
| **Open source** | ✅ MIT | Partial | ❌ |
| **Safety guardrails** | Hard-blocked restricted ops | Configurable | Configurable |
| **Analytics built-in** | `chargesDateRangeKPI` tool | Separate API | Separate API |

MONEI is purpose-built for European merchants — especially Spain, Portugal, and Andorra — with native support for local payment methods that global providers don't offer.

## Quick Start

### Connect to Claude (fastest)

**Claude.ai** — Add as a custom connector:
1. Go to **Settings → Connectors → Add**
2. Enter: `https://mcp.monei.com/mcp`
3. Complete the OAuth flow

**Claude Desktop** — Add to `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "monei": {
      "url": "https://mcp.monei.com/mcp"
    }
  }
}
```

**Claude Code:**
```bash
claude mcp add monei --transport http https://mcp.monei.com/mcp
```

### Self-host

```bash
git clone https://github.com/MONEI/MONEI-MCP-Server.git
cd MONEI-MCP-Server
npm install
cp .env.example .env   # Add your MONEI API key
npm run dev
```

Or with Docker:

```bash
docker build -t monei-mcp .
docker run -p 3000:3000 -e MONEI_API_KEY=your_key monei-mcp
```

The server starts at `http://localhost:3000` with:

| Endpoint | Purpose |
|---|---|
| `/mcp` | Streamable HTTP transport (recommended) |
| `/sse` | Legacy SSE transport |
| `/health` | Health check + GraphQL connectivity |
| `/oauth/authorize` | Merchant OAuth 2.0 flow |

## Available Tools

| Tool | Type | What it does | Example prompt |
|---|---|---|---|
| `generate_payment_link` | Write | Create a shareable payment URL | *"Generate a €50 link for order #42"* |
| `send_payment_link` | Write | Send link via email or SMS | *"Send that link to alex@example.com"* |
| `get_payment` | Read | Look up a payment by ID | *"What's the status of payment ch_abc123?"* |
| `list_payments` | Read | Search and filter transactions | *"Show me all failed payments this week"* |
| `get_payments_kpi` | Read | Revenue analytics for a date range | *"What's my revenue for March?"* |
| `get_subscription` | Read | View subscription details | *"Get details of subscription sub_xyz"* |
| `list_subscriptions` | Read | Browse subscriptions | *"List all active subscriptions"* |
| `get_account_info` | Read | Account config and payment methods | *"What payment methods do I have enabled?"* |

> Payment amounts are in cents (smallest currency unit). €10.50 = 1050.

## Security by Design

This server enforces strict guardrails on what AI assistants can do. Restricted operations are **hard-blocked at the server level** — not just hidden from the tool list.

| Blocked Operation | Why |
|---|---|
| Refund payments | Financial risk — requires manual review |
| Capture/cancel payments | Requires authorization context |
| Charge cards/Bizum directly | Requires PCI context + cardholder consent |
| Card/Bizum payouts | Funds disbursement needs compliance controls |
| Cancel subscriptions | Destructive — affects recurring revenue |
| Modify account settings | Security-sensitive configuration |
| Create/delete API keys | Credential management |
| Delete webhooks | Can break integrations |

Even if a tool call is crafted manually, the server rejects it with a clear message and links to the [MONEI Dashboard](https://dashboard.monei.com).

### Authentication & Transport Security

- **OAuth 2.0 + PKCE** (RFC 7636) — Proof Key for Code Exchange prevents authorization code interception
- **Single-use state tokens** — CSRF protection with time-limited, one-use OAuth state parameters
- **Scoped access** — Tokens limited to `payments:read`, `payments:create`, `subscriptions:read`, `account:read`
- **Rate limiting** — Per-account sliding window (60 req/min)
- **Audit logging** — Every tool call logged with timestamps, account ID, and sanitized parameters

## Architecture

```
src/
├── index.ts              # Entry — Streamable HTTP + SSE + OAuth
├── server.ts             # MCP server + tool registration
├── api/
│   └── monei-client.ts   # MONEI GraphQL API client (graphql.monei.com)
├── tools/
│   ├── index.ts          # Tool registry + routing + restriction enforcement
│   ├── payments.ts       # Payment + KPI + send link tools
│   ├── subscriptions.ts  # Subscription tools
│   └── account.ts        # Account info tool
├── auth/
│   ├── oauth.ts          # OAuth 2.0 + PKCE flow
│   ├── pkce.ts           # RFC 7636 implementation
│   └── session.ts        # Single-use state manager (CSRF)
├── middleware/
│   ├── security.ts       # CORS, security headers, input guard
│   ├── rate-limiter.ts   # Per-account sliding window
│   └── audit-logger.ts   # Structured JSON audit log
└── types/
    └── index.ts          # Types + restricted operations registry
```

All operations go through MONEI's GraphQL API (`https://graphql.monei.com`) via AWS AppSync. The previous REST client was removed in v0.2.0.

## CI/CD

| Workflow | Trigger | What it does |
|---|---|---|
| **[CI](.github/workflows/ci.yml)** | Every PR + push to `main` | TypeScript check → tests → build (Node 18/20/22) |
| **[Schema Check](.github/workflows/schema-check.yml)** | Weekly (Mon 09:00 UTC) | Introspects MONEI GraphQL API, opens issue on new operations |
| **[Dependabot](.github/dependabot.yml)** | Weekly | npm + GitHub Actions dependency updates |

Branch protection requires CI to pass + 1 approval before merging to `main`.

## Roadmap

- [ ] Anthropic Connectors Directory listing
- [ ] npm publishing (`npx @monei/mcp-server`)
- [ ] Webhook notifications for payment status changes
- [ ] Docker container + deploy templates
- [ ] Persistent token storage (Redis/PostgreSQL)
- [ ] Multi-language tool descriptions (ES, PT, FR)
- [ ] Bizum-specific tools (request-to-pay)
- [ ] Settlement and payout reporting tools
- [ ] Claude Desktop Extension (.mcpb bundle)

## Documentation

| Resource | Link |
|---|---|
| MONEI GraphQL API | [docs.monei.com/apis/graphql](https://docs.monei.com/apis/graphql/) |
| MONEI REST API | [docs.monei.com/apis/rest](https://docs.monei.com/apis/rest/) |
| Postman Collection | [postman.monei.com](https://postman.monei.com) |
| MCP Specification | [modelcontextprotocol.io](https://modelcontextprotocol.io) |
| Security Policy | [SECURITY.md](SECURITY.md) |
| Contributing | [CONTRIBUTING.md](CONTRIBUTING.md) |
| Changelog | [CHANGELOG.md](CHANGELOG.md) |

## License

MIT © [MONEI](https://monei.com)

---

<sub>MONEI Digital Payments, S.L. — Banco de España license #6911 — [monei.com](https://monei.com)</sub>
