const express = require("express");
const router = express.Router();

const autenticateSession = require("../../../Middleware/AuthenticateSession");
const verifyToken = require("../../../Middleware/VerifyToken");
const VerifyPermissions = require("../../../Middleware/VerifyPermissions");
const Auth = require('../../../Middleware/Auth')

const {
  requestStats,
  averageResponseTime,
  statusCodesCount,
  averageResponseSize,
  saveMetrics,
} = require("../../../Middleware/ApiStats");

const {
  GetAllStats,
  GetStatsByDate,
} = require("../../../Controllers/Stats/Api/GetStatsController");

router.use(requestStats);
router.use(averageResponseTime);
router.use(statusCodesCount);
router.use(averageResponseSize);
router.use(saveMetrics);
// @route   GET api/stats/

router.get(
  "/stats/all",
  Auth,
  GetAllStats
);
router.get(
  "/stats/date",
  verifyToken,
  autenticateSession,
  VerifyPermissions("canViewStats"),
  GetStatsByDate
);

module.exports = router;
