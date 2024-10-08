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

router.get("/get/:slug", GetPage);
router.delete(
  "/delete/:id",
  Auth,
  VerifyPermissions("canManagePages"),
  DeletePage
);
router.post(
  "/update/id:",
  Auth,
  VerifyPermissions("canManagePages"),
  UpdatePage
);
router.post("/create", Auth, VerifyPermissions("canManagePages"), CreatePage);

module.exports = router;
