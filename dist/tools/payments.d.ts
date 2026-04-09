import type { MoneiGraphQLClient } from "../api/monei-client.js";
export declare const paymentToolDefinitions: ({
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            amount: {
                type: string;
                description: string;
            };
            currency: {
                type: string;
                description: string;
                default: string;
            };
            orderId: {
                type: string;
                description: string;
            };
            description: {
                type: string;
                description: string;
            };
            customerEmail: {
                type: string;
                description: string;
            };
            customerName: {
                type: string;
                description: string;
            };
            customerPhone: {
                type: string;
                description: string;
            };
            paymentId?: undefined;
            search?: undefined;
            status?: undefined;
            limit?: undefined;
            offset?: undefined;
            start?: undefined;
            end?: undefined;
            interval?: undefined;
            timezone?: undefined;
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
            paymentId: {
                type: string;
                description: string;
            };
            amount?: undefined;
            currency?: undefined;
            orderId?: undefined;
            description?: undefined;
            customerEmail?: undefined;
            customerName?: undefined;
            customerPhone?: undefined;
            search?: undefined;
            status?: undefined;
            limit?: undefined;
            offset?: undefined;
            start?: undefined;
            end?: undefined;
            interval?: undefined;
            timezone?: undefined;
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
            amount?: undefined;
            currency?: undefined;
            orderId?: undefined;
            description?: undefined;
            customerEmail?: undefined;
            customerName?: undefined;
            customerPhone?: undefined;
            paymentId?: undefined;
            start?: undefined;
            end?: undefined;
            interval?: undefined;
            timezone?: undefined;
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
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            start: {
                type: string;
                description: string;
            };
            end: {
                type: string;
                description: string;
            };
            interval: {
                type: string;
                description: string;
                enum: string[];
                default: string;
            };
            timezone: {
                type: string;
                description: string;
            };
            currency: {
                type: string;
                description: string;
                default?: undefined;
            };
            amount?: undefined;
            orderId?: undefined;
            description?: undefined;
            customerEmail?: undefined;
            customerName?: undefined;
            customerPhone?: undefined;
            paymentId?: undefined;
            search?: undefined;
            status?: undefined;
            limit?: undefined;
            offset?: undefined;
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
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            paymentId: {
                type: string;
                description: string;
            };
            customerEmail: {
                type: string;
                description: string;
            };
            customerPhone: {
                type: string;
                description: string;
            };
            amount?: undefined;
            currency?: undefined;
            orderId?: undefined;
            description?: undefined;
            customerName?: undefined;
            search?: undefined;
            status?: undefined;
            limit?: undefined;
            offset?: undefined;
            start?: undefined;
            end?: undefined;
            interval?: undefined;
            timezone?: undefined;
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
})[];
export declare function handlePaymentTool(toolName: string, args: Record<string, unknown>, client: MoneiGraphQLClient): Promise<unknown>;
//# sourceMappingURL=payments.d.ts.map