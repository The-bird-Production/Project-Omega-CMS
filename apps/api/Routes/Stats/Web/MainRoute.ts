import * as express from "express";
import VerifyPermissions from "../../../Middleware/VerifyPermissions.js";
import { GetAllStats, GetStatsByDate, GetTopPages, GetTotalViews } from "../../../Controllers/Stats/Web/GetStatsController.js";
import AddStats from "../../../Controllers/Stats/Web/AddStatsController.js";
const router = express.Router();
router.get("/all", VerifyPermissions("admin"), GetAllStats);
router.get("/date", VerifyPermissions("admin"), GetStatsByDate);
router.get("/top-pages", VerifyPermissions("admin"), GetTopPages);
router.get("/total-views", VerifyPermissions("admin"), GetTotalViews);
router.post("/add", AddStats); // Public: anonymous visitor page-view tracking.
export default router;
