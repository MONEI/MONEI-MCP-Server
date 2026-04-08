/**
 * PKCE (Proof Key for Code Exchange)
 *
 * Implements RFC 7636 for OAuth 2.0 public clients.
 * Prevents authorization code interception attacks.
 */
import { randomBytes, createHash } from "node:crypto";
/**
 * Generate a cryptographically random code verifier (43-128 chars)
 */
export function generateCodeVerifier(length = 64) {
    return randomBytes(length)
        .toString("base64url")
        .slice(0, Math.max(43, Math.min(128, length)));
}
/**
 * Derive the code challenge from a code verifier using S256
 */
export function generateCodeChallenge(codeVerifier) {
    return createHash("sha256").update(codeVerifier).digest("base64url");
}
/**
 * Verify a code verifier against a stored code challenge
 */
export function verifyCodeChallenge(codeVerifier, storedChallenge) {
    const computed = generateCodeChallenge(codeVerifier);
    // Constant-time comparison to prevent timing attacks
    if (computed.length !== storedChallenge.length)
        return false;
    let result = 0;
    for (let i = 0; i < computed.length; i++) {
        result |= computed.charCodeAt(i) ^ storedChallenge.charCodeAt(i);
    }
    return result === 0;
}
//# sourceMappingURL=pkce.js.map