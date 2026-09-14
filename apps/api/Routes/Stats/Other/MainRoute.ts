import * as express from "express";
import VerifyPermissions from "../../../Middleware/VerifyPermissions.js";

import { GetNumberOfAllPage, GetNumberOfAllUser } from "../../../Controllers/Stats/Other/OtherStatsController.js";
const router = express.Router();
router.get('/number/user',  VerifyPermissions("admin"), GetNumberOfAllUser);
router.get('/number/page',  VerifyPermissions("admin"), GetNumberOfAllPage);
export default router;
