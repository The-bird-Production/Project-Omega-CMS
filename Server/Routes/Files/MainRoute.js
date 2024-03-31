const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: process.cwd() + "/Public/tmp/Files/" });

//Security MiddleWare
const VerifyToken = require("../../Middleware/VerifyToken");
const AuthenticateSession = require("../../Middleware/AuthenticateSession");

//Controller
const UpdateFile = require("../../Controllers/Files/UpdateFileController");
const CreateFile = require("../../Controllers/Files/CreateFileController");
const DeleteFIle = require("../../Controllers/Files/DeleteFileController");
const GetFile = require("../../Controllers/Files/GetFileController");

router.post(
  "/create",
  VerifyToken,
  AuthenticateSession,
  upload.single("file"),
  CreateFile
);
router.put("/update/:id", VerifyToken, AuthenticateSession, UpdateFile);
router.delete("/delete/:id", VerifyToken, AuthenticateSession, DeleteFIle);
router.get("/get/:slug", GetFile);

router.use(express.static(process.cwd() + "/Public/Files/")); //Serve static files from the public folder

module.exports = router;
