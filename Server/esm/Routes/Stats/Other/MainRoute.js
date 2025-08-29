import * as express from "express";
import VerifyPermissions from "../../../Middleware/VerifyPermissions.js";
import Auth from "../../../Middleware/Auth.js";
import { GetNumberOfAllPage, GetNumberOfAllRole, GetNumberOfAllUser } from "../../../Controllers/Stats/Other/OtherStatsController.js";
const router = express.Router();
router.get("/number/role", Auth, VerifyPermissions("canViewStats"), GetNumberOfAllRole); // Getting all stats data
router.get('/number/page', Auth, VerifyPermissions("canViewStats"), GetNumberOfAllPage);
router.get('/number/user', Auth, VerifyPermissions("canViewStats"), GetNumberOfAllUser);
export default router;
