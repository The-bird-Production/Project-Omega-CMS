const express = require("express");
const router = express.Router();

const autenticateSession = require("../../../Middleware/AuthenticateSession");
const verifyToken = require("../../../Middleware/VerifyToken");
const VerifyPermissions = require("../../../Middleware/VerifyPermissions");

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
  verifyToken,
  autenticateSession,
  VerifyPermissions("canViewStats"),
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
