import { Router } from "express";
import VerifyPermission from "../../Middleware/VerifyPermissions.js";
import { getVersion } from "../../Controllers/System/VersionController.js";
import { triggerCheck, triggerApply, getSettings, updateSettings } from "../../Controllers/System/UpdateController.js";

const router = Router();

// Public: version info isn't sensitive, and the future update-checker
// needs to be able to read it without auth.
router.get("/version", getVersion);

// Everything below triggers a live GitHub API call, a filesystem/git
// operation, or changes this instance's config — admin-only.
router.get("/update/settings", VerifyPermission("admin"), getSettings);
router.patch("/update/settings", VerifyPermission("admin"), updateSettings);
router.post("/update/check", VerifyPermission("admin"), triggerCheck);
router.post("/update/apply", VerifyPermission("admin"), triggerApply);

export default router;
