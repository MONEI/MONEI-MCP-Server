/**
 * Subscription Tools
 *
 * MCP tools for subscription operations (READ-ONLY):
 * ✅ get_subscription — View subscription details
 * ✅ list_subscriptions — Browse subscriptions
 */
import { z } from "zod";
export declare const getSubscriptionTool: {
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
        properties: {
            subscriptionId: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
};
export declare const listSubscriptionsTool: {
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
        properties: {
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
            status: {
                type: string;
                description: string;
                enum: string[];
            };
        };
    };
};
export declare const GetSubscriptionInput: z.ZodObject<{
    subscriptionId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    subscriptionId: string;
}, {
    subscriptionId: string;
}>;
export declare const ListSubscriptionsInput: z.ZodObject<{
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
    status: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    offset: number;
    status?: string | undefined;
}, {
    status?: string | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
}>;
//# sourceMappingURL=subscriptions.d.ts.map