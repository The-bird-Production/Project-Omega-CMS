const express = require('express')
const router = express.Router()

const Auth = require("../../Middleware/Auth");
const VerifyPermissions = require("../../Middleware/VerifyPermissions");
const ThemesController = require('../../Controllers/Themes/ThemeController')
const AddLogs = require('../../Functions/AddLogs')

router.get("/", Auth, VerifyPermissions("canManagePlugins"), ThemesController.getThemeInstalled)
router.get("/installable", Auth, VerifyPermissions("canManagePlugins"), ThemesController.getInstallableThemes)
router.post("/install/:id", Auth, VerifyPermissions("canManagePlugins"),AddLogs("Install a new theme" , "green"), (req,res) => ThemesController.InstallTheme(req,res,router))
router.get("/all", Auth, VerifyPermissions("canManagePlugins"), ThemesController.getAllThemes)
router.post("/update/:id", Auth, VerifyPermissions("canManagePlugins"),AddLogs("Update plugin", "info"),  (req,res) => ThemesController.UpdateTheme(req,res,router))
router.get("/current", ThemesController.getCurrentTheme)
router.get("/default", ThemesController.getDefaultTheme)



module.exports = router