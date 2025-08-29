import * as express from "express";
import VerifyPermissions from "../../../Middleware/VerifyPermissions.js";
import Auth from "../../../Middleware/Auth.js";
import { GetAllStats, GetStatsByDate } from "../../../Controllers/Stats/Web/GetStatsController.js";
import AddStats from "../../../Controllers/Stats/Web/AddStatsController.js";
const router = express.Router();
router.get("/all", Auth, GetAllStats); // Getting all stats data
router.get("/date", Auth, VerifyPermissions("canViewStats"), GetStatsByDate); // Getting stats by date
router.post("/add", AddStats);
export default router;
