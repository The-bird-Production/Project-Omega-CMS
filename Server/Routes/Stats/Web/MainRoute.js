const express = require("express");
const router = express.Router();


const VerifyPermissions = require("../../../Middleware/VerifyPermissions");
const Auth = require("../../../Middleware/Auth");
// Importing the controllers of this module
const {
  GetAllStats,
  GetStatsByDate,
} = require("../../../Controllers/Stats/Web/GetStatsController");
const AddStats = require("../../../Controllers/Stats/Web/AddStatsController");

router.get("/all", Auth, GetAllStats); // Getting all stats data
router.get(
  "/date",
  Auth,
  VerifyPermissions("canViewStats"),
  GetStatsByDate
); // Getting stats by date
router.post("/add", AddStats);

module.exports = router;
