import { randomBytes, createHash } from "node:crypto";
export function generateCodeVerifier() {
    return randomBytes(32).toString("base64url").replace(/[^a-zA-Z0-9\-._~]/g, "").slice(0, 128);
}
export function generateCodeChallenge(verifier) {
    return createHash("sha256").update(verifier).digest("base64url");
}
export function generateState() {
    return randomBytes(32).toString("base64url");
}
//# sourceMappingURL=pkce.js.map