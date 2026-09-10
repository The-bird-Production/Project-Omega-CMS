import * as express from "express";
import VerifyPermissions from "../../../Middleware/VerifyPermissions.js";

import { GetNumberOfAllPage, GetNumberOfAllRole, GetNumberOfAllUser } from "../../../Controllers/Stats/Other/OtherStatsController.js";
const router = express.Router();
router.get('/number/user',  VerifyPermissions("admin"), GetNumberOfAllUser);
router.get('/number/page',  VerifyPermissions("admin"), GetNumberOfAllPage);
router.get("/number/role",  VerifyPermissions("admin"), GetNumberOfAllRole); // Getting all stats data
export default router;
