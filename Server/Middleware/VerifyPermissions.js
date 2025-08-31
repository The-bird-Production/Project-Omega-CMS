import { auth } from "../lib/auth.js";

const VerifyPermission = (role) => {
  return async function (req, res, next) {
    try {
      if (process.env.NODE_ENV === "test") return next();

      const session = await auth.api.getSession({ headers: req.headers });
      if (!session) return res.status(401).json({ code: 401, message: "Unauthorized" });

      const canAcess = await auth.api.userHasPermission({
        body: {
          userId: session.user.id,
          permission: {"administration": ["viewDashboard"] }
        },
      });
      

      if (!canAcess) return res.status(403).json({ code: 403, message: "Forbidden" });

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
