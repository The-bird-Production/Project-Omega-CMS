const express = require("express");
const router = express.Router();

//Security MiddleWare

const VerifyPermissions = require("../../Middleware/VerifyPermissions");
const Auth = require('../../Middleware/Auth')

//Controller
const DeleteLogs = require("../../Controllers/LogController/DeleteLogsController");
const GetLogs = require("../../Controllers/LogController/GetLogsController");
const Addlogs = require('../../Functions/AddLogs')


router.delete(
  "/delete",
  Auth,
  VerifyPermissions("canDeleteLogs"),
  DeleteLogs,
  Addlogs("Delete Logs", "red")
);
router.get(
  "/get",
  Auth,
  VerifyPermissions("canGetLogs"),
  GetLogs
);

module.exports = router;
