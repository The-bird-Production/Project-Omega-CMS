const express = require("express");
const router = express.Router();

const multer = require("multer");
const upload = multer({ dest: process.cwd() + "/Public/tmp/Images/" });

//Security MiddleWare
const Auth = require('../../Middleware/Auth')

//Controller
const UpdateImage = require("../../Controllers/Images/UpdateImageController");
const CreateImage = require("../../Controllers/Images/CreateImageController");
const DeleteImage = require("../../Controllers/Images/DeleteImageController");
const GetImage = require("../../Controllers/Images/GetImageController");

router.post(
  "/create",
  Auth,
  upload.single("image"),
  CreateImage
);
router.put(
  "/update/:id",
  Auth,
  UpdateImage
);
router.delete(
  "/delete/:id",
  Auth,
  DeleteImage
);
router.get("/get/:slug", GetImage);

router.use(express.static(process.cwd() + "/Public/Images/")); //Serve static files from the public folder

module.exports = router;
