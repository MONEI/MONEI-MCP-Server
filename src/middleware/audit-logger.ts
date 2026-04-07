/**
 * Audit Logger
 *
 * Logs every MCP tool invocation for compliance and debugging.
 * Each entry captures who did what, when, and whether it succeeded.
 *
 * TODO: Replace with structured logging (e.g., Pino) and
 * external log sink (CloudWatch, Datadog, etc.) for production.
 */

export interface AuditLogEntry {
  timestamp: string;
  accountId: string;
  toolName: string;
  params: Record<string, unknown>;
  success: boolean;
  error?: string;
  durationMs: number;
}

/**
 * Log a tool invocation to stdout (structured JSON)
 */
export function logToolCall(entry: AuditLogEntry): void {
  const logLine = {
    level: entry.success ? "info" : "error",
    service: "monei-mcp-server",
    event: "tool_call",
    ...entry,
  };

  // Structured JSON log to stdout
  console.log(JSON.stringify(logLine));
}

/**
 * Create a timing wrapper for tool calls
 */
export function createAuditContext(accountId: string, toolName: string) {
  const startTime = Date.now();

  return {
    success(params: Record<string, unknown>) {
      logToolCall({
        timestamp: new Date().toISOString(),
        accountId,
        toolName,
        params,
        success: true,
        durationMs: Date.now() - startTime,
      });
    },
    failure(params: Record<string, unknown>, error: string) {
      logToolCall({
        timestamp: new Date().toISOString(),
        accountId,
        toolName,
        params,
        success: false,
        error,
        durationMs: Date.now() - startTime,
      });
    },
  };
}
