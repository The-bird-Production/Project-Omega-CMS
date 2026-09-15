import type { Request, Response } from "express";
import { prisma } from "@omega/db";

const MAX_PAGE_LENGTH = 512;

const AddStats = async (req: Request, res: Response) => {
    const page = typeof req.body?.page === "string" ? req.body.page.trim().slice(0, MAX_PAGE_LENGTH) : "";
    if (!page) {
        return res.status(400).json({ code: 400, message: "page is required" });
    }
    try {
        await prisma.stats_web.create({
            data: { page, count: 1 },
        });
        return res
            .status(200)
            .json({ code: 200, message: "Sucessfully added to stats" });
    }
    catch (e) {
        return res
            .status(500)
            .json({ code: 500, message: "Internal ServerError " + e });
    }
};
export default AddStats;
