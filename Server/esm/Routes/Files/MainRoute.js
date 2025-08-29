import * as express from "express";
import multer from "multer";
import VerifyPermissions from "../../Middleware/VerifyPermissions.js";
import UpdateFile from "../../Controllers/Files/UpdateFileController.js";
import CreateFile from "../../Controllers/Files/CreateFileController.js";
import DeleteFIle from "../../Controllers/Files/DeleteFileController.js";
import GetFile from "../../Controllers/Files/GetFileController.js";
import Auth from "../../Middleware/Auth.js";
const router = express.Router();
const upload = multer({ dest: process.cwd() + "/Public/tmp/Files/" });
router.post("/create", Auth, VerifyPermissions("canManageFiles"), upload.single("file"), CreateFile);
router.put("/update/:id", Auth, VerifyPermissions("canManageFiles"), UpdateFile);
router.delete("/delete/:id", Auth, VerifyPermissions("canManageFiles"), DeleteFIle);
router.get("/get/:slug", GetFile);
router.use(express.static(process.cwd() + "/Public/Files/")); //Serve static files from the public folder
export default router;
