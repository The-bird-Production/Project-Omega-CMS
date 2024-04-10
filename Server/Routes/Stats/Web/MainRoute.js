const express = require("express");
const router = express.Router();

const VerifyToken = require("../../../Middleware/VerifyToken");
const AuthenticateSession = require("../../../Middleware/AuthenticateSession");
const VerifyPermissions = require("../../../Middleware/VerifyPermissions");

// Importing the controllers of this module
const {
  GetAllStats,
  GetStatsByDate,
} = require("../../../Controllers/Stats/Web/GetStatsController");
const AddStats = require("../../../Controllers/Stats/Web/AddStatsController");

router.get(
  "/all",
  VerifyToken,
  AuthenticateSession,
  VerifyPermissions("canViewStats"),
  GetAllStats
); // Getting all stats data
router.get(
  "/date",
  VerifyToken,
  AuthenticateSession,
  VerifyPermissions("canViewStats"),
  GetStatsByDate
); // Getting stats by date
router.post("/add", AddStats);

module.exports = router;
