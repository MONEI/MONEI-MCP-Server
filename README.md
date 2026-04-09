# MONEI MCP Server

[![CI](https://github.com/MONEI/MONEI-MCP-Server/actions/workflows/ci.yml/badge.svg)](https://github.com/MONEI/MONEI-MCP-Server/actions/workflows/ci.yml)
[![Schema Check](https://github.com/MONEI/MONEI-MCP-Server/actions/workflows/schema-check.yml/badge.svg)](https://github.com/MONEI/MONEI-MCP-Server/actions/workflows/schema-check.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js)](https://nodejs.org/)
[![MCP](https://img.shields.io/badge/MCP-Streamable_HTTP-8B5CF6)](https://modelcontextprotocol.io)

Connect your [MONEI](https://monei.com) payment account to AI assistants like [Claude](https://claude.ai) and ChatGPT using the [Model Context Protocol](https://modelcontextprotocol.io).

Generate payment links, check transaction status, view analytics, and browse your payment history — all through natural language.

> **Live at** [`mcp.monei.com`](https://mcp.monei.com)

## Features

- **Payment Links** — Create and send payment links to customers
- **Transaction Lookup** — Get payment details and status by ID
- **Payment History** — Search and filter your transaction history
- **Analytics & KPIs** — View revenue, success rates, and time-series data
- **Subscriptions** — View subscription details and status
- **Account Info** — Check enabled payment methods and configuration
- **OAuth 2.0 + PKCE** — Secure merchant authentication with scoped permissions
- **GraphQL Native** — Direct integration with MONEI's AppSync GraphQL API
- **Guardrails** — Restricted operations are hard-blocked, not just hidden

## Security by Design

This server enforces strict guardrails on what AI assistants can do:

| Blocked Operation | Reason |
| --- | --- |
| Refund payments | Financial risk — use [MONEI Dashboard](https://dashboard.monei.com) |
| Capture/cancel payments | Requires authorization context |
| Charge cards/Bizum | Requires PCI context and cardholder consent |
| Card/Bizum payouts | Funds disbursement requires compliance controls |
| Cancel subscriptions | Destructive — use Dashboard |
| Modify account/API keys | Security-sensitive — use Dashboard |

Even if a tool call is crafted manually, restricted operations are rejected with a clear explanation.

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

Edit `.env` with your credentials:

```ini
MONEI_API_KEY=your_api_key_here
MONEI_GRAPHQL_ENDPOINT=https://graphql.monei.com  # default
```

### Run

```bash
npm run dev      # Development with hot reload
npm run build && npm start   # Production
```

The server starts with:

| Endpoint | Transport |
| --- | --- |
| `/mcp` | Streamable HTTP (recommended) |
| `/sse` | Legacy SSE |
| `/health` | Health check |
| `/oauth/authorize` | OAuth 2.0 flow |

## Connecting to Claude

### Claude.ai

1. Go to **Customize → Connectors → Add**
2. Enter: `https://mcp.monei.com/mcp`
3. Complete the OAuth authorization

### Claude Desktop

```json
{
  "mcpServers": {
    "monei": {
      "url": "https://mcp.monei.com/mcp"
    }
  }
}
```

### Claude Code

```bash
claude mcp add monei --transport http https://mcp.monei.com/mcp
```

## Available Tools

| Tool | Type | Description |
| --- | --- | --- |
| `generate_payment_link` | Write | Create a shareable payment URL |
| `send_payment_link` | Write | Send a payment link via email or SMS |
| `get_payment` | Read | Get payment details by ID |
| `list_payments` | Read | Search and filter transaction history |
| `get_payments_kpi` | Read | Revenue analytics for a date range |
| `get_subscription` | Read | View subscription details |
| `list_subscriptions` | Read | Browse subscriptions |
| `get_account_info` | Read | Account config and payment methods |

## Architecture

```
src/
├── index.ts              # Entry — Streamable HTTP + SSE + OAuth
├── server.ts             # MCP server + tool registration
├── api/
│   └── monei-client.ts   # MONEI GraphQL API client
├── tools/
│   ├── index.ts          # Tool registry + routing + restrictions
│   ├── payments.ts       # Payment + KPI + send link tools
│   ├── subscriptions.ts  # Subscription tools
│   └── account.ts        # Account info tool
├── auth/
│   ├── oauth.ts          # OAuth 2.0 + PKCE
│   ├── pkce.ts           # RFC 7636 implementation
│   └── session.ts        # Single-use state manager (CSRF)
├── middleware/
│   ├── security.ts       # CORS, headers, input guard
│   ├── rate-limiter.ts   # Per-account sliding window
│   └── audit-logger.ts   # Structured JSON audit log
└── types/
    └── index.ts          # Types + restricted operations registry

.github/
├── workflows/
│   ├── ci.yml            # Tests on every PR (Node 18/20/22)
│   └── schema-check.yml  # Weekly GraphQL introspection diff
└── dependabot.yml        # Weekly dependency updates
```

## CI/CD

| Workflow | Trigger | Purpose |
| --- | --- | --- |
| **CI** | Every PR + push to main | TypeScript check, tests, build (Node 18/20/22) |
| **Schema Check** | Weekly (Monday 09:00 UTC) | Introspects MONEI GraphQL API, opens issue on new operations |
| **Dependabot** | Weekly | npm + GitHub Actions dependency updates |

## GraphQL Migration (v0.2.0)

As of v0.2.0, the server communicates exclusively with MONEI's GraphQL API at `https://graphql.monei.com` (AWS AppSync). The previous REST client (`api.monei.com/v1`) has been removed.

Key changes from v0.1.0:

- `getAccountInfo` now uses the GraphQL `account` query (the REST `/merchants/me` endpoint never existed)
- Payment operations use `charge`/`charges`/`createPayment` GraphQL queries/mutations
- New `get_payments_kpi` tool via `chargesDateRangeKPI` query
- New `send_payment_link` tool via `sendPaymentLink` mutation
- Weekly schema drift detection via GraphQL introspection

## API Documentation

- [MONEI GraphQL API](https://docs.monei.com/apis/graphql/)
- [MONEI REST API](https://docs.monei.com/apis/rest/)
- [MONEI Postman Collection](https://postman.monei.com)
- [MCP Specification](https://modelcontextprotocol.io)

## License

MIT © [MONEI](https://monei.com)
