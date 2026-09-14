import type { Request, Response } from "express";
import fs from "fs/promises";
import { prisma } from "@omega/db";
import Addlogs from "../../Functions/AddLogs.js";

const DeleteFile = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const file = await prisma.file.findUnique({ where: { id } });
        if (!file) {
            return res.status(404).json({
                code: 404,
                message: "The File with the given ID was not found.",
            });
        }
        await fs.unlink(process.cwd() + "/Public/Files/" + file.filename);
        await prisma.file.delete({ where: { id } });
        Addlogs("Delete an image", "danger");
    }
    catch (e) {
        return res
            .status(503)
            .json({ code: 500, message: "Internal Serveur Error " + e });
    }
};
export default DeleteFile;
