import type { Request, Response } from "express";
import { prisma } from "@omega/db";
import { parseDateRange } from "../../../Functions/parseDateRange.js";

const MAX_PAGE_SIZE = 500;
const DEFAULT_PAGE_SIZE = 100;
const MAX_TOP_PAGES = 50;

function parsePagination(req: Request): { take: number; skip: number } {
    const take = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(req.query.pageSize as string, 10) || DEFAULT_PAGE_SIZE));
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    return { take, skip: (page - 1) * take };
}

const GetAllStats = async (req: Request, res: Response) => {
    try {
        const { take, skip } = parsePagination(req);
        const [data, total] = await Promise.all([
            prisma.stats_web.findMany({ orderBy: { date: "desc" }, take, skip }),
            prisma.stats_web.count(),
        ]);
        res.status(200).json({ code: 200, data, total });
    }
    catch (e) {
        return res
            .status(500)
            .json({ code: 500, message: "Internal Server Error" + e });
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
            prisma.stats_web.findMany({ where, orderBy: { date: "desc" }, take, skip }),
            prisma.stats_web.count({ where }),
        ]);
        res.status(200).json({ code: 200, data, total });
    }
    catch (e) {
        return res
            .status(500)
            .json({ code: 500, message: "Internal Server Error" + e });
    }
};

// Top viewed pages for a date range, aggregated server-side (was: fetch
// every row and reduce() in the browser).
const GetTopPages = async (req: Request, res: Response) => {
    const range = parseDateRange(req.query as Record<string, unknown>);
    if (!range) {
        return res.status(400).json({ code: 400, message: "Invalid startDate or endDate" });
    }
    try {
        const limit = Math.min(MAX_TOP_PAGES, Math.max(1, parseInt(req.query.limit as string, 10) || 10));
        const groups = await prisma.stats_web.groupBy({
            where: { date: { gte: range.startDate, lte: range.endDate } },
            by: ["page"],
            _sum: { count: true },
            orderBy: { _sum: { count: "desc" } },
            take: limit,
        });
        const data = groups.map((g: { page: string; _sum: { count: number | null } }) => ({
            page: g.page,
            views: g._sum.count ?? 0,
        }));
        res.status(200).json({ code: 200, data });
    }
    catch (e) {
        return res
            .status(500)
            .json({ code: 500, message: "Internal Server Error" + e });
    }
};

// Total page views for a date range, aggregated server-side.
const GetTotalViews = async (req: Request, res: Response) => {
    const range = parseDateRange(req.query as Record<string, unknown>);
    if (!range) {
        return res.status(400).json({ code: 400, message: "Invalid startDate or endDate" });
    }
    try {
        const aggregate = await prisma.stats_web.aggregate({
            where: { date: { gte: range.startDate, lte: range.endDate } },
            _sum: { count: true },
        });
        res.status(200).json({ code: 200, data: aggregate._sum.count ?? 0 });
    }
    catch (e) {
        return res
            .status(500)
            .json({ code: 500, message: "Internal Server Error" + e });
    }
};

export { GetAllStats, GetStatsByDate, GetTopPages, GetTotalViews };
export default {
    GetAllStats,
    GetStatsByDate,
    GetTopPages,
    GetTotalViews,
};
