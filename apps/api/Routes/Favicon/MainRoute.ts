import * as express from "express";
import multer from "multer";
import verifyPermission from "../../Middleware/VerifyPermissions.js";
import AddLogs from "../../Functions/AddLogs.js";
import { GetFavicon, UploadFavicon } from "../../Controllers/Favicon/FaviconController.js";
const router = express.Router();
const upload = multer({ dest: process.cwd() + "/Public/tmp/Favicon/", limits: { fileSize: 2 * 1024 * 1024 } });
router.get("/current", GetFavicon);
router.post("/upload", verifyPermission("admin"), upload.single("favicon"), AddLogs("Upload favicon", "green"), UploadFavicon);
router.use(express.static(process.cwd() + "/Public/favicon/")); //Serve static files from the public folder
export default router;
