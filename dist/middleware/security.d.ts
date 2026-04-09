import type { Request, Response, NextFunction } from "express";
export declare function corsHeaders(_req: Request, res: Response, next: NextFunction): void;
export declare function securityHeaders(_req: Request, res: Response, next: NextFunction): void;
export declare function bodySizeGuard(maxBytes?: number): (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=security.d.ts.map