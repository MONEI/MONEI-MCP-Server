# Security Policy

## Supported Versions

| Version | Supported          |
|---------|--------------------|
| 0.1.x   | ✅ Current          |

## Reporting a Vulnerability

**Do NOT open a public GitHub issue for security vulnerabilities.**

If you discover a security vulnerability in the MONEI MCP Server, please report it responsibly:

1. **Email:** Send details to [security@monei.com](mailto:security@monei.com)
2. **Subject:** `[SECURITY] MONEI MCP Server — <brief description>`
3. **Include:**
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We will acknowledge your report within **48 hours** and aim to provide a fix within **7 business days** for critical issues.

## Security Architecture

### Authentication & Authorization
- OAuth 2.0 with PKCE (RFC 7636) for merchant authentication
- Single-use state parameters to prevent CSRF attacks
- Scoped tokens — only `payments:read`, `payments:create`, `subscriptions:read`, and `account:read`
- Token refresh with automatic revocation on failure

### Restricted Operations
The following operations are **hard-blocked at the server level** and cannot be executed through the MCP server under any circumstances:

- Refund payments
- Charge cards or Bizum
- Card or Bizum payouts
- Cancel/delete subscriptions
- Modify account settings

### Transport Security
- Helmet.js for HTTP security headers (CSP, X-Frame-Options, HSTS, etc.)
- CORS with strict origin allowlist
- HTTPS enforcement in production with HSTS preload
- 1MB request body limit
- Content-Type validation on POST requests

### Operational Security
- Per-account sliding-window rate limiting
- Structured audit logging for every tool invocation
- Session validation on all `/messages` requests
- Automatic session cleanup on disconnect

## Scope

This security policy covers the MONEI MCP Server codebase. For vulnerabilities in the MONEI API itself, the MONEI Dashboard, or other MONEI products, please contact [security@monei.com](mailto:security@monei.com) directly.
