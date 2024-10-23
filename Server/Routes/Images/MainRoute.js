const express = require("express");
const router = express.Router();

const multer = require("multer");
const upload = multer({ dest: process.cwd() + "/Public/tmp/Images/" });

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
  CreateImage,
  AddLogs("Create Image", "green")
);
router.put(
  "/update/:id",
  Auth,
  verifyPermission("canManageImage"),
  UpdateImage,
  AddLogs("Update Image", "green")
);
router.delete(
  "/delete/:id",
  Auth,
  verifyPermission("canManageImage"),
  DeleteImage,
  AddLogs("Delete Image", "red")
);
router.get("/get/:slug", GetImage);

router.use(express.static(process.cwd() + "/Public/Images/")); //Serve static files from the public folder

module.exports = router;
