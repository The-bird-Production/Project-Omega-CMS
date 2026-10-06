import type { Request, Response } from "express";
import fs from "fs/promises";
import path from "path";
import { prisma } from "@omega/db";
import AddLog from "../../Functions/AddLogs.js";

const DeleteImage = async (req: Request, res: Response) => {
    try {
        const int = parseInt(req.params.id);
        const file = await prisma.image.findUnique({ where: { id: int } });
        if (!file) {
            return res.status(404).json({
                code: 404,
                message: "The File with the given ID was not found.",
            });
        }
        // A file already gone from disk (deleted by hand, or lost with a
        // wiped Public/ volume) must not leave an undeletable ghost row.
        try {
            await fs.unlink(process.cwd() + "/Public/Images/" + path.basename(file.file));
        } catch (unlinkErr) {
            if ((unlinkErr as NodeJS.ErrnoException).code !== "ENOENT") throw unlinkErr;
        }
        await prisma.image.delete({ where: { id: int } });
        AddLog("Delete an image", "danger");
        return res
            .status(200)
            .json({ code: 200, message: "Successfully deleted." });
    }
    catch (e) {
        console.log(e);
        return res
            .status(503)
            .json({ code: 500, message: "Internal Serveur Error " + e });
    }
};
export default DeleteImage;
