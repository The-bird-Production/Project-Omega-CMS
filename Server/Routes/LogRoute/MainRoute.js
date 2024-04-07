const express = require("express");
const router = express.Router();

//Security MiddleWare
const VerifyToken = require("../../Middleware/VerifyToken");
const AuthenticateSession = require("../../Middleware/AuthenticateSession");
const VerifyPermissions = require("../../../Middleware/VerifyPermissions");

//Controller
const DeleteLogs = require("../../Controllers/LogController/DeleteLogsController");
const GetLogs = require("../../Controllers/LogController/GetLogsController");

router.delete(
  "/delete",
  VerifyToken,
  AuthenticateSession,
  VerifyPermissions("canDeleteLogs"),
  DeleteLogs
);
router.get(
  "/get",
  VerifyToken,
  AuthenticateSession,
  VerifyPermissions("canGetLogs"),
  GetLogs
);

module.exports = router;
