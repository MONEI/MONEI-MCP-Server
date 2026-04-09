import { generateCodeVerifier, generateCodeChallenge } from "./pkce.js";
export const ALLOWED_SCOPES = ["payments:read", "payments:create", "subscriptions:read", "account:read"];
const tokenStore = new Map();
const pkceStore = new Map();
export function getAuthorizationUrl(config, state) {
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);
    pkceStore.set(state, codeVerifier);
    const params = new URLSearchParams({
        client_id: config.oauth.clientId, redirect_uri: config.oauth.redirectUri,
        response_type: "code", scope: ALLOWED_SCOPES.join(" "), state,
        code_challenge: codeChallenge, code_challenge_method: "S256",
    });
    return `https://auth.monei.com/oauth/authorize?${params.toString()}`;
}
export async function exchangeCodeForTokens(config, code, state) {
    const codeVerifier = pkceStore.get(state);
    pkceStore.delete(state);
    const body = {
        grant_type: "authorization_code", client_id: config.oauth.clientId,
        client_secret: config.oauth.clientSecret, redirect_uri: config.oauth.redirectUri, code,
    };
    if (codeVerifier)
        body.code_verifier = codeVerifier;
    const response = await fetch("https://auth.monei.com/oauth/token", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    });
    if (!response.ok)
        throw new Error(`OAuth token exchange failed: ${await response.text()}`);
    const data = (await response.json());
    const tokens = {
        accessToken: data.access_token, refreshToken: data.refresh_token,
        expiresAt: Date.now() + data.expires_in * 1000, scope: data.scope, accountId: data.account_id,
    };
    tokenStore.set(tokens.accountId, tokens);
    return tokens;
}
export function getStoredTokens(accountId) { return tokenStore.get(accountId); }
export function revokeTokens(accountId) { tokenStore.delete(accountId); }
//# sourceMappingURL=oauth.js.map