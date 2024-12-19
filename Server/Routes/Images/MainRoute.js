const express = require("express");
const router = express.Router();

const multer = require("multer");
const upload = multer({ dest: process.cwd() + "/Public/tmp/Images/", limits: {fileSize: 50 * 1024 * 1024} });

//Security MiddleWare
const Auth = require('../../Middleware/Auth')
const verifyPermission = require('../../Middleware/VerifyPermissions')

//Controller
const UpdateImage = require("../../Controllers/Images/UpdateImageController");
const CreateImage = require("../../Controllers/Images/CreateImageController");
const DeleteImage = require("../../Controllers/Images/DeleteImageController");
const GetImage = require("../../Controllers/Images/GetImageController");

const AddLogs = require('../../Functions/AddLogs')


router.post(
  "/create",
  Auth, 
  verifyPermission("canManageImage"),
  upload.single("image"),
  AddLogs("Create Image", "green"),
  CreateImage,
  
);
router.put(
  "/update/:id",
  Auth,
  verifyPermission("canManageImage"),
  AddLogs("Update Image", "green"),
  UpdateImage,
  
);
router.delete(
  "/delete/:id",
  Auth,
  verifyPermission("canManageImage"),
  AddLogs("Delete Image", "red"),
  DeleteImage,
  
);
router.get("/get/:slug", GetImage);

router.use(express.static(process.cwd() + "/Public/Images/")); //Serve static files from the public folder

module.exports = router;
