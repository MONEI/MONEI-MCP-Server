/**
 * PKCE (Proof Key for Code Exchange)
 *
 * Implements RFC 7636 for OAuth 2.0 public clients.
 * Prevents authorization code interception attacks.
 */
/**
 * Generate a cryptographically random code verifier (43-128 chars)
 */
export declare function generateCodeVerifier(length?: number): string;
/**
 * Derive the code challenge from a code verifier using S256
 */
export declare function generateCodeChallenge(codeVerifier: string): string;
/**
 * Verify a code verifier against a stored code challenge
 */
export declare function verifyCodeChallenge(codeVerifier: string, storedChallenge: string): boolean;
//# sourceMappingURL=pkce.d.ts.map