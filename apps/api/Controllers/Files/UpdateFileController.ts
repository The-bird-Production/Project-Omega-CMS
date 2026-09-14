import type { Request, Response } from "express";
import { prisma } from "@omega/db";
import Addlogs from "../../Functions/AddLogs.js";

const UpdateFile = async (req: Request, res: Response) => {
    try {
        await prisma.file.update({
            where: {
                id: Number(req.params.id),
            },
            data: {
                name: req.body.name,
            },
        });
        Addlogs("Update an image", "primary");
    }
    catch (e) {
        return res
            .status(503)
            .json({ code: 503, message: "Internal Server Error " + e });
    }
};
export default UpdateFile;
