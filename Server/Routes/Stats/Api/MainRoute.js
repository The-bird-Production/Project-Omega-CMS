import * as express from "express";
import VerifyPermissions from "../../../Middleware/VerifyPermissions.js";
import { requestStats, averageResponseTime, statusCodesCount, averageResponseSize, saveMetrics } from "../../../Middleware/ApiStats.js";
import { GetAllStats, GetStatsByDate } from "../../../Controllers/Stats/Api/GetStatsController.js";
const router = express.Router();
router.use(requestStats);
router.use(averageResponseTime);
router.use(statusCodesCount);
router.use(averageResponseSize);
router.use(saveMetrics);
// @route   GET api/stats/
router.get("/stats/all",  GetAllStats);
router.get("/stats/date",  VerifyPermissions("admin"), GetStatsByDate);
export default router;
