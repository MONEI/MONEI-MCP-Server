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
export declare function logToolCall(entry: AuditLogEntry): void;
/**
 * Create a timing wrapper for tool calls
 */
export declare function createAuditContext(accountId: string, toolName: string): {
    success(params: Record<string, unknown>): void;
    failure(params: Record<string, unknown>, error: string): void;
};
//# sourceMappingURL=audit-logger.d.ts.map