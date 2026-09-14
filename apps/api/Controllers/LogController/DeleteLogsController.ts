import type { Request, Response } from "express";
import { prisma } from "@omega/db";

const DeleteLogs = async (req: Request, res: Response) => {
    let startId = parseInt(req.query.startId as string);
    let endId = parseInt(req.query.endId as string);
    try {
        await prisma.log.deleteMany({
            where: {
                id: {
                    gte: startId || 0,
                    lte: endId || 0,
                },
            },
        });
        return res.status(200).json({ code: 200, message: "Sucessfully delete" });
    }
    catch (e) {
        console.log("Error" + e);
        return res
            .status(503)
            .json({ code: 503, message: "Internal Server Error " + e });
    }
};
export default DeleteLogs;
