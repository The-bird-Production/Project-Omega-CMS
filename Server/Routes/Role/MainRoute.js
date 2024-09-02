const express = require("express");
const router = express.Router();

//Security MiddleWare
const VerifyPermissions = require("../../Middleware/VerifyPermissions");
const VerifyToken = require("../../Middleware/VerifyToken");
const AuthenticateSession = require("../../Middleware/AuthenticateSession");
const Auth = require('../../Middleware/Auth')

const CreateRole = require("../../Controllers/Role/CreateRoleController");
const UpdateRole = require("../../Controllers/Role/UpdateRoleController");
const DeleteRole = require("../../Controllers/Role/DeleteRoleController");
const GetSingleRole = require("../../Controllers/Role/GetRoleController");
const GetAllRole = require("../../Controllers/Role/GetAllRoleController");

router.post(
  "/create",
  Auth,
  CreateRole
);
router.put(
  "/update/:id",
  Auth,
  UpdateRole
);
router.delete(
  "/remove/:id",
  Auth,
  DeleteRole
);
router.get(
  "/get/all",
  Auth,
  GetAllRole
);
router.get(
  "/get/:id",
  Auth,
  GetSingleRole
);

module.exports = router;
