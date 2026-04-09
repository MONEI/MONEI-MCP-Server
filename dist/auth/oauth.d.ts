import type { OAuthTokens, ServerConfig } from "../types/index.js";
export declare const ALLOWED_SCOPES: readonly ["payments:read", "payments:create", "subscriptions:read", "account:read"];
export declare function getAuthorizationUrl(config: ServerConfig, state: string): string;
export declare function exchangeCodeForTokens(config: ServerConfig, code: string, state: string): Promise<OAuthTokens>;
export declare function getStoredTokens(accountId: string): OAuthTokens | undefined;
export declare function revokeTokens(accountId: string): void;
//# sourceMappingURL=oauth.d.ts.map