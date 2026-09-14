import type { Request, Response } from "express";
import { prisma } from "@omega/db";
import AddLog from "../../Functions/AddLogs.js";

const UpdateImage = async (req: Request, res: Response) => {
    try {
        await prisma.image.update({
            where: {
                id: parseInt(req.params.id),
            },
            data: {
                title: req.body.title,
                alt: req.body.alt,
                slug: req.body.slug
            },
        });
        AddLog("UPDATE an image", "info");
        return res
            .status(201)
            .json({ code: 201, message: "Image sucessfully updated " });
    }
    catch (e) {
        return res
            .status(503)
            .json({ code: 503, message: "Internal Server Error " + e });
    }
};
export default UpdateImage;
