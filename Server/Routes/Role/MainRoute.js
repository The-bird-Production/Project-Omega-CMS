const express = require("express");
const router = express.Router();

//Security MiddleWare
const Auth = require('../../Middleware/Auth')

const CreateRole = require("../../Controllers/Role/CreateRoleController");
const UpdateRole = require("../../Controllers/Role/UpdateRoleController");
const DeleteRole = require("../../Controllers/Role/DeleteRoleController");
const GetSingleRole = require("../../Controllers/Role/GetRoleController");
const GetAllRole = require("../../Controllers/Role/GetAllRoleController");
const VerifyPermission = require("../../Middleware/VerifyPermissions");

router.post(
  "/create",
  Auth,
  VerifyPermission("canManageRole"),
  CreateRole
);
router.post(
  "/update/:id",
  Auth,
  VerifyPermission("canManageRole"),
  UpdateRole
);
router.delete(
  "/remove/:id",
  Auth,
  VerifyPermission("canManageRole"),
  DeleteRole
);
router.get(
  "/get/all",
  Auth,
  VerifyPermission("canManageRole"),
  GetAllRole
);
router.get(
  "/get/:id",
  Auth,
  GetSingleRole
);

module.exports = router;
