import * as express from "express";
import VerifyPermissions from "../../Middleware/VerifyPermissions.js";
import DeleteLogs from "../../Controllers/LogController/DeleteLogsController.js";
import GetLogs from "../../Controllers/LogController/GetLogsController.js";
import Addlogs from "../../Functions/AddLogs.js";
const router = express.Router();
router.delete("/delete",  VerifyPermissions("admin"), Addlogs("Delete Logs", "red"), DeleteLogs);
router.get("/get",  VerifyPermissions("admin"), GetLogs);
export default router;
