const express = require("express");
const router = express.Router();

//Security MiddleWare
const VerifyToken = require("../../Middleware/VerifyToken");
const AuthenticateSession = require("../../Middleware/AuthenticateSession");

//Controller
const DeleteLogs = require("../../Controllers/LogController/DeleteLogsController");
const GetLogs = require("../../Controllers/LogController/GetLogsController");

router.delete("/delete", VerifyToken, AuthenticateSession, DeleteLogs);
router.get("/get", VerifyToken, AuthenticateSession, GetLogs);

module.exports = router;
