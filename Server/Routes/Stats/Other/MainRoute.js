const express = require("express");
const router = express.Router();


const VerifyPermissions = require("../../../Middleware/VerifyPermissions");
const Auth = require("../../../Middleware/Auth");
// Importing the controllers of this module
const {GetNumberOfAllPage, GetNumberOfAllRole,GetNumberOfAllUser} = require('../../../Controllers/Stats/Other/OtherStatsController')


router.get("/number/role", Auth,VerifyPermissions("canViewStats"), GetNumberOfAllRole); // Getting all stats data
router.get('/number/page', Auth, VerifyPermissions("canViewStats"), GetNumberOfAllPage)
router.get('/number/user', Auth, VerifyPermissions("canViewStats"), GetNumberOfAllUser)




module.exports = router;
