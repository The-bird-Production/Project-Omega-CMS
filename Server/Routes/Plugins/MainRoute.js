const express = require('express')
const router = express.Router()

const Auth = require("../../Middleware/Auth");
const VerifyPermissions = require("../../Middleware/VerifyPermissions");
const PluginsController = require('../../Controllers/Plugins/PluginsController')
const AddLogs = require('../../Functions/AddLogs')
const {loadAllPlugins} = require('../../Functions/LoadPlugin')

router.get("/", Auth, VerifyPermissions("canManagePlugins"), PluginsController.getPluginsInstalled)
router.get("/installable", Auth, VerifyPermissions("canManagePlugins"), PluginsController.getInstallablePlugins)
router.post("/install/:id", Auth, VerifyPermissions("canManagePlugins"),AddLogs("Install a new plugin" , "green"), (req,res) => PluginsController.InstallPlugin(req,res,router))
router.get("/user-routes", PluginsController.getUserRoutes)

loadAllPlugins(router)




module.exports = router