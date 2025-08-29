import * as express from "express";
import * as LoginControler from "../../Controllers/Auth/LoginController.js";
const router = express.Router();
// @route   POST api/auth
router.post("/", LoginControler.Login);
export default router;
