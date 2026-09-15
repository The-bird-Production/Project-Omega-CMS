import * as express from "express";
import VerifyPermissions from "../../../Middleware/VerifyPermissions.js";
import { GetAllStats, GetStatsByDate, GetSummary } from "../../../Controllers/Stats/Api/GetStatsController.js";
const router = express.Router();
router.get("/all", VerifyPermissions("admin"), GetAllStats);
router.get("/date", VerifyPermissions("admin"), GetStatsByDate);
router.get("/summary", VerifyPermissions("admin"), GetSummary);
export default router;
