const express = require('express')
const router = express.Router()

const Auth = require("../../Middleware/Auth");
const VerifyPermissions = require("../../Middleware/VerifyPermissions");
const PluginsController = require('../../Controllers/Plugins/PluginsController')
const AddLogs = require('../../Functions/AddLogs')

router.get("/", Auth, VerifyPermissions("canManagePlugins"), PluginsController.getPluginsInstalled)
router.get("/installable", Auth, VerifyPermissions("canManagePlugins"), PluginsController.getInstallablePlugins)
router.post("/install/:id", Auth, VerifyPermissions("canManagePlugins"),AddLogs("Install a new plugin" , "green"), PluginsController.InstallPlugin)
router.get("/user-routes", PluginsController.getUserRoutes)



module.exports = router