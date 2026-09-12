import { Router } from "express";
import { getVersion } from "../../Controllers/System/VersionController.js";

const router = Router();

// Public: version info isn't sensitive, and the future update-checker
// needs to be able to read it without auth.
router.get("/version", getVersion);

export default router;
