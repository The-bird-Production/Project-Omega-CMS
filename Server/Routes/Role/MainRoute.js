const express = require("express");
const router = express.Router();

//Security MiddleWare
const VerifyPermissions = require("../../Middleware/VerifyPermissions");
const VerifyToken = require("../../Middleware/VerifyToken");
const AuthenticateSession = require("../../Middleware/AuthenticateSession");

const CreateRole = require("../../Controllers/Role/CreateRoleController");
const UpdateRole = require("../../Controllers/Role/UpdateRoleController");
const DeleteRole = require("../../Controllers/Role/DeleteRoleController");
const GetSingleRole = require("../../Controllers/Role/GetRoleController");
const GetAllRole = require("../../Controllers/Role/GetAllRoleController");

router.post(
  "/create",
  VerifyToken,
  AuthenticateSession,
  VerifyPermissions("CanManageRole"),
  CreateRole
);
router.put(
  "/update/:id",
  VerifyToken,
  AuthenticateSession,
  VerifyPermissions("CanManageRole"),
  UpdateRole
);
router.delete(
  "/remove/:id",
  VerifyToken,
  AuthenticateSession,
  VerifyPermissions("CanManageRole"),
  DeleteRole
);
router.get(
  "/get/all",
  VerifyToken,
  AuthenticateSession,
  VerifyPermissions("CanViewRoles"),
  GetAllRole
);
router.get(
  "/get/:id",
  VerifyToken,
  AuthenticateSession,
  VerifyPermissions("CanViewRoles"),
  GetSingleRole
);

module.exports = router;
