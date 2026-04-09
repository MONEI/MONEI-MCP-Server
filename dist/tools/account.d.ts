import type { MoneiGraphQLClient } from "../api/monei-client.js";
export declare const accountToolDefinitions: {
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
export declare function handleAccountTool(toolName: string, _args: Record<string, unknown>, client: MoneiGraphQLClient): Promise<unknown>;
//# sourceMappingURL=account.d.ts.map