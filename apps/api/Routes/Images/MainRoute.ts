import * as express from "express";
import multer from "multer";
import verifyPermission from "../../Middleware/VerifyPermissions.js";
import UpdateImage from "../../Controllers/Images/UpdateImageController.js";
import CreateImage from "../../Controllers/Images/CreateImageController.js";
import DeleteImage from "../../Controllers/Images/DeleteImageController.js";
import GetImage from "../../Controllers/Images/GetImageController.js";
import AddLogs from "../../Functions/AddLogs.js";
const router = express.Router();
const upload = multer({ dest: process.cwd() + "/Public/tmp/Images/", limits: { fileSize: 50 * 1024 * 1024 } });
router.post("/create",  verifyPermission("admin"), upload.single("image"), AddLogs("Create Image", "green"), CreateImage.CreateImage);
router.post("/create-article", verifyPermission("admin"), upload.single("image"), AddLogs("Create Article Image", "green"), CreateImage.CreateArticleImage);
router.put("/update/:id",  verifyPermission("admin"), AddLogs("Update Image", "green"), UpdateImage);
router.delete("/delete/:id",  verifyPermission("admin"), AddLogs("Delete Image", "red"), DeleteImage);
router.get("/get/:slug", GetImage);
router.use(express.static(process.cwd() + "/Public/Images/")); //Serve static files from the public folder
export default router;
