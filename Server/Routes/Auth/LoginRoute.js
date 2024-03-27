const express = require("express");

const router = express.Router();
const LoginControler = require("../../Controllers/Auth/LoginController");
// @route   POST api/auth

router.post("/", LoginControler.Login);


module.exports = router;
