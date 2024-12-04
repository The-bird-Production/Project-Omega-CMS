const express = require("express");
const router = express.Router();

//Security MiddleWare

const Auth = require("../../Middleware/Auth");
const VerifyPermissions = require("../../Middleware/VerifyPermissions");

//Controllers
const GetPage = require("../../Controllers/Pages/GetPageController");
const UpdatePage = require("../../Controllers/Pages/UpdatePageController");
const DeletePage = require("../../Controllers/Pages/DeletePageController");
const CreatePage = require("../../Controllers/Pages/CreatePageController");

const AddLogs = require('../../Functions/AddLogs');
const { GetAllPage } = require("../../Controllers/Pages/GetAllPageController");
router.get('/get/all', GetAllPage);
router.get("/get/:slug", GetPage);

router.delete(
  "/delete/:id",
  Auth,
  VerifyPermissions("canManagePages"),
  AddLogs("Delete Page", "red"),
  DeletePage,
  
);
router.post(
  "/update/:id",
  Auth,
  VerifyPermissions("canManagePages"),
  AddLogs("Update page", "green"),
  UpdatePage,
  
);
router.post("/create", Auth, VerifyPermissions("canManagePages"),AddLogs("Create page", "green"), CreatePage);

module.exports = router;
