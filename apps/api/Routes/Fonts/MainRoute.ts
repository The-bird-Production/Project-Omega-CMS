import * as express from "express";
import multer from "multer";
import verifyPermission from "../../Middleware/VerifyPermissions.js";
import AddLogs from "../../Functions/AddLogs.js";
import { listFonts, uploadFont, deleteFont, getFontsCss } from "../../Controllers/Fonts/FontController.js";
const router = express.Router();
const upload = multer({ dest: process.cwd() + "/Public/tmp/Fonts/", limits: { fileSize: 10 * 1024 * 1024 } });
router.get("/all", verifyPermission("admin"), listFonts);
router.post("/upload", verifyPermission("admin"), upload.single("font"), AddLogs("Upload font", "green"), uploadFont);
router.delete("/delete/:id", verifyPermission("admin"), AddLogs("Delete font", "red"), deleteFont);
router.get("/css", getFontsCss);
router.use(express.static(process.cwd() + "/Public/Fonts/")); //Serve font files from the public folder
export default router;
