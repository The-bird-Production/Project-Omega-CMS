import type { Request, Response } from "express";
import { prisma } from "@omega/db";
import { parseDevice, parseBrowser } from "../../../Functions/parseUserAgent.js";

const MAX_PAGE_LENGTH = 512;
const MAX_FIELD_LENGTH = 191; // matches the VARCHAR(191) columns

function optionalField(value: unknown): string | undefined {
    if (typeof value !== "string") return undefined;
    const trimmed = value.trim().slice(0, MAX_FIELD_LENGTH);
    return trimmed || undefined;
}

const AddStats = async (req: Request, res: Response) => {
    const page = typeof req.body?.page === "string" ? req.body.page.trim().slice(0, MAX_PAGE_LENGTH) : "";
    if (!page) {
        return res.status(400).json({ code: 400, message: "page is required" });
    }
    const visitorId = optionalField(req.body?.visitorId);
    const referrer = optionalField(req.body?.referrer);
    const userAgent = typeof req.body?.userAgent === "string" ? req.body.userAgent : "";
    try {
        await prisma.stats_web.create({
            data: {
                page,
                count: 1,
                visitorId,
                referrer,
                device: parseDevice(userAgent),
                browser: parseBrowser(userAgent),
            },
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
