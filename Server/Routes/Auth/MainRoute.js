const express = require("express");
const router = express.Router();
const LoginRoute = require("./LoginRoute");
const RegisterRoute = require('./RegisterRoute');

router.use("/login", LoginRoute);
router.use("/register",  RegisterRoute)

module.exports = router;
