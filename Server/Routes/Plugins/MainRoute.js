const express = require('express')
const router = express.Router()

const Auth = require("../../Middleware/Auth");
const VerifyPermissions = require("../../Middleware/VerifyPermissions");
const PluginsController = require('../../Controllers/Plugins/PluginsController')

router.get("/", Auth, VerifyPermissions("canManagePlugins"), PluginsController.getPlugins)
router.get("/user-routes", PluginsController.getUserRoutes)



module.exports = router