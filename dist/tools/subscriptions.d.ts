import type { MoneiGraphQLClient } from "../api/monei-client.js";
export declare const subscriptionToolDefinitions: ({
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            subscriptionId: {
                type: string;
                description: string;
            };
            search?: undefined;
            status?: undefined;
            limit?: undefined;
            offset?: undefined;
        };
        required: string[];
    };
    annotations: {
        title: string;
        readOnlyHint: boolean;
        destructiveHint: boolean;
        idempotentHint: boolean;
        openWorldHint: boolean;
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            search: {
                type: string;
                description: string;
            };
            status: {
                type: string;
                description: string;
                enum: string[];
            };
            limit: {
                type: string;
                description: string;
                default: number;
            };
            offset: {
                type: string;
                description: string;
                default: number;
            };
            subscriptionId?: undefined;
        };
        required?: undefined;
    };
    annotations: {
        title: string;
        readOnlyHint: boolean;
        destructiveHint: boolean;
        idempotentHint: boolean;
        openWorldHint: boolean;
    };
})[];
export declare function handleSubscriptionTool(toolName: string, args: Record<string, unknown>, client: MoneiGraphQLClient): Promise<unknown>;
//# sourceMappingURL=subscriptions.d.ts.map