import type { Request, Response } from "express";
import { prisma } from "@omega/db";
import { parseDateRange } from "../../../Functions/parseDateRange.js";

const MAX_PAGE_SIZE = 500;
const DEFAULT_PAGE_SIZE = 100;

function parsePagination(req: Request): { take: number; skip: number } {
    const take = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(req.query.pageSize as string, 10) || DEFAULT_PAGE_SIZE));
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    return { take, skip: (page - 1) * take };
}

const GetAllStats = async (req: Request, res: Response) => {
    try {
        const { take, skip } = parsePagination(req);
        const [data, total] = await Promise.all([
            prisma.stats_api.findMany({ orderBy: { date: "desc" }, take, skip }),
            prisma.stats_api.count(),
        ]);
        res.status(200).json({ code: 200, data, total });
    }
    catch (e) {
        return res
            .status(500)
            .json({ code: 500, message: "Internal Server Error " + e });
    }
};

const GetStatsByDate = async (req: Request, res: Response) => {
    const range = parseDateRange(req.query as Record<string, unknown>);
    if (!range) {
        return res.status(400).json({ code: 400, message: "Invalid startDate or endDate" });
    }
    try {
        const { take, skip } = parsePagination(req);
        const where = { date: { gte: range.startDate, lte: range.endDate } };
        const [data, total] = await Promise.all([
            prisma.stats_api.findMany({ where, orderBy: { date: "desc" }, take, skip }),
            prisma.stats_api.count({ where }),
        ]);
        res.status(200).json({ code: 200, data, total });
    }
    catch (e) {
        return res
            .status(500)
            .json({ code: 500, message: "Internal Server Error " + e });
    }
};

// Server-side aggregation for the admin dashboard — replaces pulling every
// row over the wire and reducing it in the browser.
const GetSummary = async (req: Request, res: Response) => {
    const range = parseDateRange(req.query as Record<string, unknown>);
    if (!range) {
        return res.status(400).json({ code: 400, message: "Invalid startDate or endDate" });
    }
    try {
        const where = { date: { gte: range.startDate, lte: range.endDate } };
        const [aggregate, statusGroups] = await Promise.all([
            prisma.stats_api.aggregate({
                where,
                _count: { _all: true },
                _avg: { responseTime: true, responseSize: true },
            }),
            prisma.stats_api.groupBy({ where, by: ["statusCode"], _count: { _all: true } }),
        ]);

        const statusCodeCounts: Record<number, number> = {};
        for (const group of statusGroups) {
            statusCodeCounts[group.statusCode] = group._count._all;
        }

        res.status(200).json({
            code: 200,
            data: {
                totalRequests: aggregate._count._all,
                averageResponseTime: aggregate._avg.responseTime ?? 0,
                averageResponseSize: aggregate._avg.responseSize ?? 0,
                statusCodeCounts,
            },
        });
    }
    catch (e) {
        return res
            .status(500)
            .json({ code: 500, message: "Internal Server Error " + e });
    }
};

export { GetAllStats, GetStatsByDate, GetSummary };
export default {
    GetAllStats,
    GetStatsByDate,
    GetSummary,
};
