import type { Request, Response, NextFunction } from "express";
import { prisma } from "@omega/db";

// Records one real row per API request (method, path, status, timing, size)
// once the response has actually finished sending. Replaces a previous
// design that chained five separate middlewares to accumulate
// process-lifetime running totals in memory and then persisted that
// cumulative snapshot as a new row on every request — meaning stored rows
// never reflected a single request's actual metrics, only ever-growing
// totals since the process started.
export function trackApiRequest(req: Request, res: Response, next: NextFunction): void {
    const start = Date.now();
    let responseSize = 0;

    const originalSend = res.send.bind(res);
    res.send = function (this: Response, body?: unknown) {
        if (body !== undefined) {
            responseSize = Buffer.byteLength(typeof body === "string" ? body : JSON.stringify(body));
        }
        return originalSend(body as never);
    };

    res.on("finish", () => {
        prisma.stats_api
            .create({
                data: {
                    method: req.method,
                    path: req.originalUrl.split("?")[0],
                    statusCode: res.statusCode,
                    responseTime: Date.now() - start,
                    responseSize,
                },
            })
            .catch((error: unknown) => {
                console.error("Error saving API stats:", error);
            });
    });

    next();
}

export default trackApiRequest;
