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
import { createOAuthSession, consumeOAuthSession } from "./session.js";
/**
 * OAuth scopes that map to allowed MCP operations.
 * These are the ONLY scopes the server will request.
 */
export const ALLOWED_SCOPES = [
    "payments:read", // Get/list payments
    "payments:create", // Create payment links only
    "subscriptions:read", // Get/list subscriptions
    "account:read", // Read account info
];
/**
 * In-memory token store.
 * TODO: Replace with persistent encrypted storage (Redis, DB) for production.
 */
const tokenStore = new Map();
/**
 * Generate the MONEI OAuth authorization URL with PKCE + state
 *
 * @returns Object containing the authorization URL and the state for later validation
 */
export function getAuthorizationUrl(config) {
    const session = createOAuthSession();
    const params = new URLSearchParams({
        client_id: config.oauth.clientId,
        redirect_uri: config.oauth.redirectUri,
        response_type: "code",
        scope: ALLOWED_SCOPES.join(" "),
        state: session.state,
        code_challenge: session.codeChallenge,
        code_challenge_method: "S256",
    });
    // TODO: Update with actual MONEI OAuth endpoint when available
    return {
        url: `https://auth.monei.com/oauth/authorize?${params.toString()}`,
        state: session.state,
    };
}
/**
 * Exchange authorization code for tokens.
 * Validates state parameter and includes PKCE code_verifier.
 */
export async function exchangeCodeForTokens(config, code, state) {
    // Validate and consume the session (single-use state)
    const session = consumeOAuthSession(state);
    if (!session) {
        throw new OAuthError("Invalid or expired OAuth state. This may indicate a CSRF attack or an expired authorization. Please try again.", "invalid_state");
    }
    // TODO: Update with actual MONEI OAuth token endpoint
    const response = await fetch("https://auth.monei.com/oauth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            grant_type: "authorization_code",
            client_id: config.oauth.clientId,
            client_secret: config.oauth.clientSecret,
            redirect_uri: config.oauth.redirectUri,
            code,
            code_verifier: session.codeVerifier,
        }),
    });
    if (!response.ok) {
        const error = await response.text();
        throw new OAuthError(`Token exchange failed: ${error}`, "token_exchange_failed");
    }
    const data = (await response.json());
    // Validate returned scopes don't exceed what we requested
    const returnedScopes = data.scope.split(" ");
    const allowedSet = new Set(ALLOWED_SCOPES);
    const excessScopes = returnedScopes.filter((s) => !allowedSet.has(s));
    if (excessScopes.length > 0) {
        throw new OAuthError(`Token contains unexpected scopes: ${excessScopes.join(", ")}`, "scope_violation");
    }
    const tokens = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: Date.now() + data.expires_in * 1000,
        scope: data.scope,
        accountId: data.account_id,
    };
    tokenStore.set(tokens.accountId, tokens);
    return tokens;
}
/**
 * Refresh an expired access token
 */
export async function refreshAccessToken(config, accountId) {
    const existing = tokenStore.get(accountId);
    if (!existing?.refreshToken) {
        throw new OAuthError("No refresh token available. Re-authorization required.", "no_refresh_token");
    }
    const response = await fetch("https://auth.monei.com/oauth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            grant_type: "refresh_token",
            client_id: config.oauth.clientId,
            client_secret: config.oauth.clientSecret,
            refresh_token: existing.refreshToken,
        }),
    });
    if (!response.ok) {
        tokenStore.delete(accountId);
        throw new OAuthError("Token refresh failed. Re-authorization required.", "refresh_failed");
    }
    const data = (await response.json());
    const tokens = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token ?? existing.refreshToken,
        expiresAt: Date.now() + data.expires_in * 1000,
        scope: data.scope,
        accountId: data.account_id,
    };
    tokenStore.set(tokens.accountId, tokens);
    return tokens;
}
/**
 * Retrieve stored tokens for an account
 */
export function getTokens(accountId) {
    return tokenStore.get(accountId);
}
/**
 * Revoke tokens for an account
 */
export function revokeTokens(accountId) {
    return tokenStore.delete(accountId);
}
/**
 * Check if tokens are expired (with 60s buffer)
 */
export function isTokenExpired(tokens) {
    return Date.now() >= tokens.expiresAt - 60_000;
}
/**
 * Validate that requested scopes are within allowed set
 */
export function validateScopes(requestedScopes) {
    const allowedSet = new Set(ALLOWED_SCOPES);
    return requestedScopes.every((scope) => allowedSet.has(scope));
}
// ─── Error Class ────────────────────────────────────────────
export class OAuthError extends Error {
    code;
    constructor(message, code) {
        super(message);
        this.code = code;
        this.name = "OAuthError";
    }
}
//# sourceMappingURL=oauth.js.map