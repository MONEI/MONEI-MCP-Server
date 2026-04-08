/**
 * OAuth Session Manager
 *
 * Manages OAuth state parameters and PKCE verifiers
 * to prevent CSRF and authorization code interception.
 *
 * TODO: Replace with Redis for production multi-instance deployments.
 */
import { randomBytes } from "node:crypto";
import { generateCodeVerifier, generateCodeChallenge } from "./pkce.js";
const SESSION_TTL_MS = 10 * 60 * 1000; // 10 minutes
const sessions = new Map();
/**
 * Create a new OAuth session with state + PKCE
 */
export function createOAuthSession() {
    const state = randomBytes(32).toString("hex");
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);
    const now = Date.now();
    const session = {
        state,
        codeVerifier,
        codeChallenge,
        createdAt: now,
        expiresAt: now + SESSION_TTL_MS,
    };
    sessions.set(state, session);
    // Garbage-collect expired sessions
    pruneExpiredSessions();
    return session;
}
/**
 * Validate and consume an OAuth state parameter.
 * Returns the session if valid, null if invalid/expired/missing.
 * The session is consumed (deleted) after validation — single use.
 */
export function consumeOAuthSession(state) {
    const session = sessions.get(state);
    if (!session)
        return null;
    // Always delete — single use
    sessions.delete(state);
    // Check expiry
    if (Date.now() > session.expiresAt)
        return null;
    return session;
}
/**
 * Remove expired sessions to prevent memory leaks
 */
function pruneExpiredSessions() {
    const now = Date.now();
    for (const [state, session] of sessions.entries()) {
        if (now > session.expiresAt) {
            sessions.delete(state);
        }
    }
}
/**
 * Get count of active sessions (for monitoring)
 */
export function getActiveSessionCount() {
    pruneExpiredSessions();
    return sessions.size;
}
//# sourceMappingURL=session.js.map