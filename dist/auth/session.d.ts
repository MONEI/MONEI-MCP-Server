/**
 * OAuth Session Manager
 *
 * Manages OAuth state parameters and PKCE verifiers
 * to prevent CSRF and authorization code interception.
 *
 * TODO: Replace with Redis for production multi-instance deployments.
 */
interface OAuthSession {
    state: string;
    codeVerifier: string;
    codeChallenge: string;
    createdAt: number;
    /** Session expires after 10 minutes */
    expiresAt: number;
}
/**
 * Create a new OAuth session with state + PKCE
 */
export declare function createOAuthSession(): OAuthSession;
/**
 * Validate and consume an OAuth state parameter.
 * Returns the session if valid, null if invalid/expired/missing.
 * The session is consumed (deleted) after validation — single use.
 */
export declare function consumeOAuthSession(state: string): OAuthSession | null;
/**
 * Get count of active sessions (for monitoring)
 */
export declare function getActiveSessionCount(): number;
export {};
//# sourceMappingURL=session.d.ts.map