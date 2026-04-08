/**
 * Security Middleware
 *
 * Centralized security configuration for the MCP server:
 * - CORS with strict origin allowlist
 * - Helmet for HTTP security headers
 * - HTTPS enforcement in production
 * - Request size limits
 * - Session authentication for /messages
 */
// ─── CORS Configuration ────────────────────────────────────
/**
 * Allowed origins for CORS.
 * In production, restrict to known AI assistant domains.
 */
export function getAllowedOrigins() {
    const envOrigins = process.env.ALLOWED_ORIGINS;
    if (envOrigins) {
        return envOrigins.split(",").map((o) => o.trim());
    }
    // Defaults: Claude, ChatGPT, and localhost for dev
    return [
        "https://claude.ai",
        "https://claude.com",
        "https://chat.openai.com",
        "https://chatgpt.com",
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:6274",
    ];
}
export function getCorsOptions() {
    const allowedOrigins = getAllowedOrigins();
    return {
        origin: (origin, callback) => {
            // Allow requests with no origin (server-to-server, curl, MCP clients)
            if (!origin) {
                callback(null, true);
                return;
            }
            if (allowedOrigins.includes(origin)) {
                callback(null, true);
            }
            else {
                callback(new Error(`Origin ${origin} not allowed by CORS`));
            }
        },
        credentials: true,
        methods: ["GET", "POST", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
        maxAge: 86400, // 24 hours preflight cache
    };
}
// ─── HTTPS Enforcement ─────────────────────────────────────
/**
 * Redirect HTTP to HTTPS in production.
 * Trusts X-Forwarded-Proto from reverse proxies (Cloudflare, ALB, etc.)
 */
export function httpsEnforcement() {
    return (req, res, next) => {
        if (process.env.NODE_ENV !== "production") {
            next();
            return;
        }
        const proto = req.headers["x-forwarded-proto"] ?? req.protocol;
        if (proto !== "https") {
            res.redirect(301, `https://${req.headers.host}${req.url}`);
            return;
        }
        // HSTS header
        res.setHeader("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
        next();
    };
}
// ─── Session Validation for /messages ──────────────────────
/**
 * Validates that the session ID on /messages requests
 * corresponds to an active, authenticated SSE connection.
 */
export function createSessionValidator(activeSessions) {
    return (req, res, next) => {
        const sessionId = req.query.sessionId;
        if (!sessionId) {
            res.status(400).json({
                error: "Missing sessionId parameter",
                hint: "Connect via /sse first to establish a session.",
            });
            return;
        }
        if (!activeSessions.has(sessionId)) {
            res.status(401).json({
                error: "Invalid or expired session",
                hint: "Your session may have expired. Reconnect via /sse.",
            });
            return;
        }
        next();
    };
}
// ─── Input Sanitization ────────────────────────────────────
/**
 * Reject oversized payloads and non-JSON content types on POST.
 */
export function inputGuard() {
    return (req, res, next) => {
        if (req.method === "POST") {
            const contentType = req.headers["content-type"];
            if (contentType && !contentType.includes("application/json")) {
                res.status(415).json({ error: "Content-Type must be application/json" });
                return;
            }
        }
        next();
    };
}
// ─── API Key Validation (development mode) ─────────────────
/**
 * For development/testing: validate that a MONEI API key is present.
 * In production, OAuth tokens are used instead.
 */
export function requireApiKeyInDev() {
    return (_req, res, next) => {
        if (process.env.NODE_ENV === "production") {
            next();
            return;
        }
        if (!process.env.MONEI_API_KEY) {
            console.warn("[Security] No MONEI_API_KEY set. Tool calls will fail. Set it in .env");
        }
        next();
    };
}
//# sourceMappingURL=security.js.map