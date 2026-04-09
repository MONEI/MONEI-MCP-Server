/**
 * Shared types for the MONEI MCP Server
 */
export interface ServerConfig {
    port: number;
    host: string;
    moneiGraphqlEndpoint: string;
    oauth: {
        clientId: string;
        clientSecret: string;
        redirectUri: string;
    };
}
export interface OAuthTokens {
    accessToken: string;
    refreshToken?: string;
    expiresAt: number;
    scope: string;
    accountId: string;
}
export interface RestrictedOperation {
    name: string;
    graphqlOperation: string;
    reason: string;
    alternative: string;
}
export declare const RESTRICTED_OPERATIONS: RestrictedOperation[];
export declare function isRestricted(operationName: string): RestrictedOperation | undefined;
//# sourceMappingURL=index.d.ts.map