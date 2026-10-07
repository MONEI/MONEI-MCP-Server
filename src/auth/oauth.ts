import type { OAuthTokens, ServerConfig } from "../types/index.js";
import { generateCodeVerifier, generateCodeChallenge } from "./pkce.js";

export const ALLOWED_SCOPES = ["payments:read", "payments:create", "subscriptions:read", "account:read"] as const;

const tokenStore = new Map<string, OAuthTokens>();
const pkceStore = new Map<string, string>();

export function getAuthorizationUrl(config: ServerConfig, state: string): string {
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

export async function exchangeCodeForTokens(config: ServerConfig, code: string, state: string): Promise<OAuthTokens> {
  const codeVerifier = pkceStore.get(state);
  pkceStore.delete(state);

  const body: Record<string, string> = {
    grant_type: "authorization_code", client_id: config.oauth.clientId,
    client_secret: config.oauth.clientSecret, redirect_uri: config.oauth.redirectUri, code,
  };
  if (codeVerifier) body.code_verifier = codeVerifier;

  const response = await fetch("https://auth.monei.com/oauth/token", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`OAuth token exchange failed: ${await response.text()}`);

  const data = (await response.json()) as { access_token: string; refresh_token?: string; expires_in: number; scope: string; account_id: string };
  const tokens: OAuthTokens = {
    accessToken: data.access_token, refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000, scope: data.scope, accountId: data.account_id,
  };
  tokenStore.set(tokens.accountId, tokens);
  return tokens;
}

export function getStoredTokens(accountId: string): OAuthTokens | undefined { return tokenStore.get(accountId); }
export function revokeTokens(accountId: string): void { tokenStore.delete(accountId); }
