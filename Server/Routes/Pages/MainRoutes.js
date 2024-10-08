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

const AddLogs = require('../../Functions/AddLogs')

router.get("/get/:slug", GetPage);
router.delete(
  "/delete/:id",
  Auth,
  VerifyPermissions("canManagePages"),
  DeletePage,
  AddLogs(req, "Delete Page", "red")
);
router.post(
  "/update/id:",
  Auth,
  VerifyPermissions("canManagePages"),
  UpdatePage,
  AddLogs(req, "Update page", "green")
);
router.post("/create", Auth, VerifyPermissions("canManagePages"), CreatePage, AddLogs(req, "Create page", "green"));

module.exports = router;
