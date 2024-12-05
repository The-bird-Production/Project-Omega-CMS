const express = require("express");
const router = express.Router();
const LoginRoute = require("./LoginRoute");
const RegisterRoute = require("./RegisterRoute");
const Auth = require("../../Middleware/Auth");
const VerifyPermissions = require("../../Middleware/VerifyPermissions");
const GetAllUserController = require("../../Controllers/Auth/GetAllUserController");
const DeleteUserController = require("../../Controllers/Auth/DeleteUserController");
const GetUserById = require("../../Controllers/Auth/GetUserById")
const AddLogs = require("../../Functions/AddLogs");

router.use("/login", LoginRoute);
router.use("/register", RegisterRoute);

router.get(
  "/get/all",
  Auth,
  VerifyPermissions("canManageUser"),
  GetAllUserController.GetAllUser
);
router.delete(
  "/delete/:id",
  Auth,
  VerifyPermissions("canManageUser"),
  AddLogs("Delete user", "red"),
  DeleteUserController.Delete
);
router.get("/get/:id",Auth, VerifyPermissions("canManageUser"), GetUserById.GetUserById);

module.exports = router;
