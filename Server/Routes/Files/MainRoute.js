const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: process.cwd() + "/Public/tmp/Files/" });

//Security MiddleWare

const VerifyPermissions = require("../../Middleware/VerifyPermissions");

//Controller
const UpdateFile = require("../../Controllers/Files/UpdateFileController");
const CreateFile = require("../../Controllers/Files/CreateFileController");
const DeleteFIle = require("../../Controllers/Files/DeleteFileController");
const GetFile = require("../../Controllers/Files/GetFileController");
const Auth = require('../../Middleware/Auth')
router.post(
  "/create",

  Auth,
  VerifyPermissions("canManageFiles"),
  upload.single("file"),
  CreateFile
);
router.put(
  "/update/:id",
  Auth,
  VerifyPermissions("canManageFiles"),
  UpdateFile
);
router.delete(
  "/delete/:id",
  Auth,
  VerifyPermissions("canManageFiles"),
  DeleteFIle
);
router.get("/get/:slug", GetFile);

router.use(express.static(process.cwd() + "/Public/Files/")); //Serve static files from the public folder

module.exports = router;
