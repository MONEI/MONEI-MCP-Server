/**
 * Tool Registry
 *
 * Central registry for all MCP tools. Handles:
 * - Registration of allowed tools
 * - Routing tool calls to the appropriate handler
 * - Blocking restricted operations with clear messages
 */
import type { MoneiApiClient } from "../api/monei-client.js";
export declare const TOOL_DEFINITIONS: {
    name: string;
    title: string;
    description: string;
    annotations: {
        readOnlyHint: boolean;
        destructiveHint: boolean;
        idempotentHint: boolean;
        openWorldHint: boolean;
    };
    inputSchema: {
        type: "object";
        properties: {};
    };
}[];
export declare function handleToolCall(toolName: string, args: Record<string, unknown>, apiClient: MoneiApiClient): Promise<{
    content: Array<{
        type: "text";
        text: string;
    }>;
    isError?: boolean;
}>;
//# sourceMappingURL=index.d.ts.map