/**
 * OAuth 2.0 Authorization Provider
 *
 * Implements the OAuth 2.0 authorization code flow with PKCE (RFC 7636)
 * for connecting merchant MONEI accounts to AI assistants.
 *
 * Flow:
 *  1. Server creates session with state + PKCE challenge
 *  2. AI assistant redirects merchant to /oauth/authorize
 *  3. Merchant logs into MONEI and grants scopes
 *  4. MONEI redirects back with authorization code + state
 *  5. Server validates state, exchanges code + PKCE verifier for tokens
 *  6. Tokens are scoped to allowed operations only
 */
import type { OAuthTokens, ServerConfig } from "../types/index.js";
/**
 * OAuth scopes that map to allowed MCP operations.
 * These are the ONLY scopes the server will request.
 */
export declare const ALLOWED_SCOPES: readonly ["payments:read", "payments:create", "subscriptions:read", "account:read"];
export type AllowedScope = (typeof ALLOWED_SCOPES)[number];
/**
 * Generate the MONEI OAuth authorization URL with PKCE + state
 *
 * @returns Object containing the authorization URL and the state for later validation
 */
export declare function getAuthorizationUrl(config: ServerConfig): {
    url: string;
    state: string;
};
/**
 * Exchange authorization code for tokens.
 * Validates state parameter and includes PKCE code_verifier.
 */
export declare function exchangeCodeForTokens(config: ServerConfig, code: string, state: string): Promise<OAuthTokens>;
/**
 * Refresh an expired access token
 */
export declare function refreshAccessToken(config: ServerConfig, accountId: string): Promise<OAuthTokens>;
/**
 * Retrieve stored tokens for an account
 */
export declare function getTokens(accountId: string): OAuthTokens | undefined;
/**
 * Revoke tokens for an account
 */
export declare function revokeTokens(accountId: string): boolean;
/**
 * Check if tokens are expired (with 60s buffer)
 */
export declare function isTokenExpired(tokens: OAuthTokens): boolean;
/**
 * Validate that requested scopes are within allowed set
 */
export declare function validateScopes(requestedScopes: string[]): boolean;
export declare class OAuthError extends Error {
    readonly code: string;
    constructor(message: string, code: string);
}
//# sourceMappingURL=oauth.d.ts.map