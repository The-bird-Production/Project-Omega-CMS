const express = require('express')
const router = express.Router()

const Auth = require("../../Middleware/Auth");
const VerifyPermissions = require("../../Middleware/VerifyPermissions");
const PluginsController = require('../../Controllers/Plugins/PluginsController')

router.get("/", Auth, VerifyPermissions("canManagePlugins"), PluginsController.getPluginsInstalled)
router.get("/installable", Auth, VerifyPermissions("canManagePlugins"), PluginsController.getInstallablePlugins)
router.post("/install/:id", Auth, VerifyPermissions("canManagePlugins"), PluginsController.InstallPlugin)
router.get("/user-routes", PluginsController.getUserRoutes)



module.exports = router