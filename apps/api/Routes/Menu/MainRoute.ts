import * as express from "express";
import VerifyPermissions from "../../Middleware/VerifyPermissions.js";
import AddLogs from "../../Functions/AddLogs.js";
import { getMenu, getAllMenuItems, createMenuItem, updateMenuItem, deleteMenuItem } from "../../Controllers/Menu/MenuController.js";
const router = express.Router();
router.get("/all", VerifyPermissions("admin"), getAllMenuItems);
router.post("/add", VerifyPermissions("admin"), AddLogs("Add menu item", "green"), createMenuItem);
router.post("/update/:id", VerifyPermissions("admin"), AddLogs("Update menu item", "info"), updateMenuItem);
router.delete("/delete/:id", VerifyPermissions("admin"), AddLogs("Delete menu item", "red"), deleteMenuItem);
// Public: themes fetch their nav this way (see apps/web/lib/menu.js).
router.get("/:menu", getMenu);
export default router;
