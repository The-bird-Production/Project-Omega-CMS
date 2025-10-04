import * as express from "express";
import VerifyPermissions from "../../../Middleware/VerifyPermissions.js";
import { GetAllStats, GetStatsByDate } from "../../../Controllers/Stats/Web/GetStatsController.js";
import AddStats from "../../../Controllers/Stats/Web/AddStatsController.js";
const router = express.Router();
router.get("/all",  GetAllStats); // Getting all stats data
router.get("/date",  VerifyPermissions("admin"), GetStatsByDate); // Getting stats by date
router.post("/add", AddStats);
export default router;
