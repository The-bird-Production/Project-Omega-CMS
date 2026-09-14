import type { Request, Response } from "express";
import { prisma } from "@omega/db";

const GetLogs = async (req: Request, res: Response) => {
    let startId = parseInt(req.query.startId as string);
    let endId = parseInt(req.query.endId as string);
    try {
        const logs = await prisma.log.findMany({
            where: {
                id: {
                    gte: startId || 1,
                    lte: endId || 50,
                },
            }, orderBy: {
                id: 'desc'
            }
        });
        const totalItems = await prisma.log.count();
        return res.status(200).json({ code: 200, totalItems: totalItems, data: logs });
    }
    catch (e) {
        console.log("Error: ", e);
        res.status(500).json({ code: 500, message: "Internal Server Error " + e });
    }
};
export default GetLogs;
