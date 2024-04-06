const express = require("express");
const router = express.Router();

const autenticateSession = require("../../../Middleware/AuthenticateSession");
const verifyToken = require("../../../Middleware/VerifyToken");

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

router.get("/stats/all", verifyToken, autenticateSession, GetAllStats);
router.get("/stats/date", verifyToken, autenticateSession, GetStatsByDate);

module.exports = router;
