import type { MoneiGraphQLClient } from "../api/monei-client.js";
export declare const ALL_TOOL_DEFINITIONS: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {};
    };
    annotations: {
        title: string;
        readOnlyHint: boolean;
        destructiveHint: boolean;
        idempotentHint: boolean;
        openWorldHint: boolean;
    };
}[];
export declare function handleToolCall(toolName: string, args: Record<string, unknown>, client: MoneiGraphQLClient): Promise<{
    content: Array<{
        type: string;
        text: string;
    }>;
    isError?: boolean;
}>;
//# sourceMappingURL=index.d.ts.map