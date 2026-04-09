export interface AuditEntry {
    timestamp: string;
    tool: string;
    accountId?: string;
    args: Record<string, unknown>;
    success: boolean;
    durationMs: number;
    error?: string;
}
export declare function logToolCall(entry: AuditEntry): void;
export declare function getRecentAuditEntries(count?: number): AuditEntry[];
export declare function withAudit<T>(tool: string, args: Record<string, unknown>, accountId: string | undefined, fn: () => Promise<T>): Promise<T>;
//# sourceMappingURL=audit-logger.d.ts.map