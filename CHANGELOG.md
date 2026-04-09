# Changelog

All notable changes to the MONEI MCP Server are documented here.

## [0.2.0] — 2026-04-09

### Breaking Changes

- **REST → GraphQL migration**: All MONEI API calls now go through `https://graphql.monei.com` (AWS AppSync). The REST client (`api.monei.com/v1`) has been removed.
- `ServerConfig.moneiApiBaseUrl` replaced with `moneiGraphqlEndpoint`.
- `MoneiApiClient` class replaced with `MoneiGraphQLClient`.
- `getAccountInfo()` no longer calls `/merchants/me` (endpoint never existed) — uses GraphQL `account` query instead.

### Added

- **`get_payments_kpi` tool** — Revenue analytics via `chargesDateRangeKPI` query. Returns totals, success/failed/refunded counts, and time-series data.
- **`send_payment_link` tool** — Send payment links to customers via email or SMS using `sendPaymentLink` mutation.
- **GitHub Actions CI** — Tests on every PR with Node 18/20/22 matrix, TypeScript check, and build verification.
- **Weekly schema check** — Introspects MONEI GraphQL API every Monday, auto-opens GitHub issue when new queries/mutations are detected.
- **Dependabot** — Weekly dependency updates for npm packages and GitHub Actions.
- **Branch protection** — `main` requires CI pass + 1 approval before merge.
- `CONTRIBUTING.md` — Developer guide for adding tools and running tests.
- `CHANGELOG.md` — This file.
- `Dockerfile` — Production container image.

### Changed

- Restricted operations now reference GraphQL mutation names (`refundPayment`, `capturePayment`, etc.) instead of generic action names.
- Tool definitions use raw JSON schemas instead of Zod bridge for MCP SDK compatibility.
- Server uses low-level MCP `Server` class instead of `McpServer` for full schema control.
- Removed `helmet`, `cors`, `@types/cors` dependencies — replaced with lightweight custom middleware.
- README rewritten with strategic positioning, demo section, comparison table, and CI badges.

### Fixed

- `get_account_info` no longer attempts to call non-existent REST endpoint.

## [0.1.0] — 2026-04-07

### Added

- Initial release with MCP server skeleton.
- OAuth 2.0 + PKCE (RFC 7636) authentication flow.
- Streamable HTTP (`/mcp`) and SSE (`/sse`) transport support.
- Tools: `generate_payment_link`, `get_payment`, `list_payments`, `get_subscription`, `list_subscriptions`, `get_account_info`.
- Tool safety annotations (`readOnlyHint`, `destructiveHint`).
- Restricted operations hard-block with clear Dashboard redirect.
- Per-account rate limiting (sliding window).
- Structured JSON audit logging.
- Single-use OAuth state tokens (CSRF protection).
- Security middleware (CORS, headers, input guards).
- Test suite with Vitest.
- Railway deployment config.
