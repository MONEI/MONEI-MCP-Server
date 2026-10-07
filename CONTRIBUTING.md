# Contributing to MONEI MCP Server

Thank you for your interest in contributing! This guide covers the development workflow, how to add new tools, and the review process.

## Development Setup

```bash
git clone https://github.com/MONEI/MONEI-MCP-Server.git
cd MONEI-MCP-Server
npm install
cp .env.example .env
```

Add your MONEI API key to `.env`:

```ini
MONEI_API_KEY=your_test_api_key
```

### Run locally

```bash
npm run dev          # Development with hot reload
npm run typecheck    # TypeScript check (no emit)
npm test             # Run test suite
npm test -- --watch  # Watch mode
npm run build        # Production build
```

### Test with MCP Inspector

```bash
npx @modelcontextprotocol/inspector http://localhost:3000/mcp
```

## Adding a New Tool

Every MCP tool follows the same pattern. Here's how to add one:

### 1. Add the GraphQL query/mutation to `src/api/monei-client.ts`

```typescript
async getWebhooks(): Promise<unknown> {
  const data = await this.execute<{ webhooks: unknown }>(
    `query { webhooks { items { id url events status } total } }`
  );
  return data.webhooks;
}
```

### 2. Create or update the tool definition in `src/tools/`

```typescript
// In the appropriate file (payments.ts, subscriptions.ts, or a new file)
export const myToolDefinitions = [
  {
    name: "list_webhooks",
    description: "List configured webhooks and their status.",
    inputSchema: {
      type: "object" as const,
      properties: { /* ... */ },
    },
    annotations: {
      title: "List Webhooks",
      readOnlyHint: true,        // true for read-only, false for writes
      destructiveHint: false,     // true if it deletes/modifies
      idempotentHint: true,       // true if safe to retry
      openWorldHint: false,       // true if it has external side effects
    },
  },
];
```

### 3. Add the handler function

```typescript
export async function handleMyTool(
  toolName: string,
  args: Record<string, unknown>,
  client: MoneiGraphQLClient
): Promise<unknown> {
  switch (toolName) {
    case "list_webhooks":
      return client.getWebhooks();
    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}
```

### 4. Register in `src/tools/index.ts`

Add your definitions to `ALL_TOOL_DEFINITIONS` and your handler to the router.

### 5. Add tests

Create or update tests in `tests/tools/` to verify:
- Tool definition has all required fields and annotations
- Restricted operations are blocked (if applicable)
- Handler calls the correct GraphQL client method

### 6. Check if the operation should be restricted

If the tool modifies data in a way that could cause financial loss or is irreversible, add it to `RESTRICTED_OPERATIONS` in `src/types/index.ts` instead of exposing it as a tool.

## Pull Request Process

1. Create a feature branch: `git checkout -b feat/my-feature`
2. Make your changes
3. Run the full check: `npm run typecheck && npm test && npm run build`
4. Commit with a conventional commit message: `feat: add webhook listing tool`
5. Push and open a PR against `main`
6. CI must pass (Node 18/20/22 matrix)
7. One approval required from a maintainer

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` — New feature or tool
- `fix:` — Bug fix
- `chore:` — Maintenance (deps, CI, config)
- `docs:` — Documentation only
- `refactor:` — Code change that doesn't fix a bug or add a feature
- `test:` — Adding or updating tests

## Architecture Decisions

- **GraphQL only** — All MONEI operations go through `graphql.monei.com`. No REST calls.
- **Raw JSON schemas** — Tool definitions use plain JSON schema objects (not Zod) for MCP SDK compatibility.
- **Safety first** — Any tool that can move money, delete data, or change configuration must be in `RESTRICTED_OPERATIONS`. When in doubt, restrict.
- **No secrets in client** — API keys and OAuth secrets are server-side only. Never expose them in tool responses.

## Questions?

Open an issue or reach out to the MONEI team at [hello@monei.com](mailto:hello@monei.com).
