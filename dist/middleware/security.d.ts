/**
 * Security Middleware
 *
 * Centralized security configuration for the MCP server:
 * - CORS with strict origin allowlist
 * - Helmet for HTTP security headers
 * - HTTPS enforcement in production
 * - Request size limits
 * - Session authentication for /messages
 */
import type { Request, Response, NextFunction } from "express";
/**
 * Allowed origins for CORS.
 * In production, restrict to known AI assistant domains.
 */
export declare function getAllowedOrigins(): string[];
export declare function getCorsOptions(): {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => void;
    credentials: boolean;
    methods: string[];
    allowedHeaders: string[];
    maxAge: number;
};
/**
 * Redirect HTTP to HTTPS in production.
 * Trusts X-Forwarded-Proto from reverse proxies (Cloudflare, ALB, etc.)
 */
export declare function httpsEnforcement(): (req: Request, res: Response, next: NextFunction) => void;
/**
 * Validates that the session ID on /messages requests
 * corresponds to an active, authenticated SSE connection.
 */
export declare function createSessionValidator(activeSessions: Map<string, unknown>): (req: Request, res: Response, next: NextFunction) => void;
/**
 * Reject oversized payloads and non-JSON content types on POST.
 */
export declare function inputGuard(): (req: Request, res: Response, next: NextFunction) => void;
/**
 * For development/testing: validate that a MONEI API key is present.
 * In production, OAuth tokens are used instead.
 */
export declare function requireApiKeyInDev(): (_req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=security.d.ts.map