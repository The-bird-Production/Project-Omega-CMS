const express = require("express");
const router = express.Router();
const LoginRoute = require("./LoginRoute");

router.use("/login", LoginRoute);

module.exports = router;
