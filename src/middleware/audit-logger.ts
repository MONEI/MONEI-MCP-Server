export interface AuditEntry {
  timestamp: string; tool: string; accountId?: string;
  args: Record<string, unknown>; success: boolean; durationMs: number; error?: string;
}

const auditLog: AuditEntry[] = [];

export function logToolCall(entry: AuditEntry): void {
  console.log(JSON.stringify({ type: "audit", ...entry }));
  auditLog.push(entry);
  if (auditLog.length > 10000) auditLog.splice(0, auditLog.length - 10000);
}

export function getRecentAuditEntries(count = 50): AuditEntry[] { return auditLog.slice(-count); }

export async function withAudit<T>(tool: string, args: Record<string, unknown>, accountId: string | undefined, fn: () => Promise<T>): Promise<T> {
  const start = Date.now();
  try {
    const result = await fn();
    logToolCall({ timestamp: new Date().toISOString(), tool, accountId, args, success: true, durationMs: Date.now() - start });
    return result;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logToolCall({ timestamp: new Date().toISOString(), tool, accountId, args, success: false, durationMs: Date.now() - start, error: msg });
    throw error;
  }
}
