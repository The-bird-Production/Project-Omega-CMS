import { auth } from "../lib/auth.js";

// requiredRole: the better-auth role a caller must have (e.g. "admin") to reach the route.
const VerifyPermission = (requiredRole) => {
  return async function (req, res, next) {
    try {
      const session = await auth.api.getSession({ headers: req.headers });
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
        .json({ code: 500, message: "Internal Server Error: " + e.message });
    }
  };
};

export default VerifyPermission;
