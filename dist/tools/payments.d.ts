/**
 * Payment Tools
 *
 * MCP tools for payment operations:
 * ✅ generate_payment_link — Create a shareable payment URL
 * ✅ get_payment — Retrieve payment details by ID
 * ✅ list_payments — Search/filter transaction history
 */
import { z } from "zod";
export declare const generatePaymentLinkTool: {
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
            expireAt: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
};
export declare const getPaymentTool: {
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
            paymentId: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
};
export declare const listPaymentsTool: {
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
            fromDate: {
                type: string;
                description: string;
            };
            toDate: {
                type: string;
                description: string;
            };
            orderId: {
                type: string;
                description: string;
            };
        };
    };
};
export declare const GeneratePaymentLinkInput: z.ZodObject<{
    amount: z.ZodNumber;
    currency: z.ZodDefault<z.ZodString>;
    orderId: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    customerEmail: z.ZodOptional<z.ZodString>;
    customerName: z.ZodOptional<z.ZodString>;
    expireAt: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    amount: number;
    currency: string;
    orderId?: string | undefined;
    description?: string | undefined;
    customerEmail?: string | undefined;
    customerName?: string | undefined;
    expireAt?: number | undefined;
}, {
    amount: number;
    currency?: string | undefined;
    orderId?: string | undefined;
    description?: string | undefined;
    customerEmail?: string | undefined;
    customerName?: string | undefined;
    expireAt?: number | undefined;
}>;
export declare const GetPaymentInput: z.ZodObject<{
    paymentId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    paymentId: string;
}, {
    paymentId: string;
}>;
export declare const ListPaymentsInput: z.ZodObject<{
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
    status: z.ZodOptional<z.ZodString>;
    fromDate: z.ZodOptional<z.ZodString>;
    toDate: z.ZodOptional<z.ZodString>;
    orderId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    offset: number;
    orderId?: string | undefined;
    status?: string | undefined;
    fromDate?: string | undefined;
    toDate?: string | undefined;
}, {
    orderId?: string | undefined;
    status?: string | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
    fromDate?: string | undefined;
    toDate?: string | undefined;
}>;
//# sourceMappingURL=payments.d.ts.map