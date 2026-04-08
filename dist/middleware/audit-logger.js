/**
 * Audit Logger
 *
 * Logs every MCP tool invocation for compliance and debugging.
 * Each entry captures who did what, when, and whether it succeeded.
 *
 * TODO: Replace with structured logging (e.g., Pino) and
 * external log sink (CloudWatch, Datadog, etc.) for production.
 */
/**
 * Log a tool invocation to stdout (structured JSON)
 */
export function logToolCall(entry) {
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
export function createAuditContext(accountId, toolName) {
    const startTime = Date.now();
    return {
        success(params) {
            logToolCall({
                timestamp: new Date().toISOString(),
                accountId,
                toolName,
                params,
                success: true,
                durationMs: Date.now() - startTime,
            });
        },
        failure(params, error) {
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
//# sourceMappingURL=audit-logger.js.map