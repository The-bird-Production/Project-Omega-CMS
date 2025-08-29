import * as express from "express";
import { Register } from "../../Controllers/Auth/RegisterController.js";
const router = express.Router();
router.post('/', Register);
export default router;
