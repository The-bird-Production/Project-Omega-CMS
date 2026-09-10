import type { Request, Response, NextFunction, RequestHandler } from "express";
import { auth } from "../lib/auth.js";

type Session = Awaited<ReturnType<typeof auth.api.getSession>>;
type RequestWithSession = Request & { session?: Session };

// requiredRole: the better-auth role a caller must have (e.g. "admin") to reach the route.
const VerifyPermission = (requiredRole?: string): RequestHandler => {
  return async (req: RequestWithSession, res: Response, next: NextFunction) => {
    try {
      const session = await auth.api.getSession({ headers: req.headers as any });
      if (!session) return res.status(401).json({ code: 401, message: "Unauthorized" });

      if (requiredRole && session.user.role !== requiredRole) {
        return res.status(403).json({ code: 403, message: "Forbidden" });
      }

      req.session = session;
      return next();
    } catch (e) {
      console.error("VerifyPermission error:", e);
      return res
        .status(500)
        .json({ code: 500, message: "Internal Server Error: " + (e as Error).message });
    }
  };
};

export default VerifyPermission;
