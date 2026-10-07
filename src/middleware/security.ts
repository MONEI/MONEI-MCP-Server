import type { Request, Response, NextFunction } from "express";

export function corsHeaders(_req: Request, res: Response, next: NextFunction): void {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Session-Id");
  res.setHeader("Access-Control-Max-Age", "86400");
  next();
}

export function securityHeaders(_req: Request, res: Response, next: NextFunction): void {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
}

export function bodySizeGuard(maxBytes = 512 * 1024) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const len = parseInt(req.headers["content-length"] || "0", 10);
    if (len > maxBytes) { res.status(413).json({ error: "Request body too large" }); return; }
    next();
  };
}
