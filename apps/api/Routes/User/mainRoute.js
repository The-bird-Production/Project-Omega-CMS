import * as express from "express"

const router = express.Router();
import VerifyPermission from "../../Middleware/VerifyPermissions.js"
import { getUser } from "../../Controllers/User/MainController.js";

router.get('/get/:id', VerifyPermission("admin"), getUser)

export default router;