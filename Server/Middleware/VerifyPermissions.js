// middleware/VerifyPermission.js
import { auth } from "../lib/auth.js";

const VerifyPermission = (permission) => {
  return async function (req, res, next) {
    try {
      if (process.env.NODE_ENV === "test") {
        return next();
      }

      // Récupération de la session utilisateur
      const session = await auth.api.getSession({ req, res });

      if (!session) {
        return res.status(401).json({ code: 401, message: "Unauthorized" });
      }

      // Vérification via Better Auth
      const { data, error } = await auth.api.userHasPermission({
        body: {
          userId: session.user.id, // obligatoire
          role: permission, // 🔥 à ajuster selon comment tu structures tes rôles
          // 🔥 à ajuster selon comment tu structures tes permissions
        },
      });

      if (error || !data) {
        return res.status(403).json({ code: 403, message: "Forbidden" });
      }

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
