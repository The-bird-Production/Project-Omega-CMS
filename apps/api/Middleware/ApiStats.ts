import type { Request, Response, NextFunction } from "express";
import { prisma } from "@omega/db";

// Création d'un objet global pour stocker les statistiques
const stats = {
    requestStats: { totalRequests: 0 },
    averageResponseTime: { totalTime: 0, totalRequests: 0 },
    statusCodesCount: { 200: 0, 400: 0, 404: 0, 500: 0 } as Record<number, number>,
    averageResponseSize: { totalSize: 0, totalRequests: 0 },
};

// Middleware pour collecter les statistiques des requêtes entrantes
function requestStats(req: Request, res: Response, next: NextFunction) {
    stats.requestStats.totalRequests++;
    next();
}

// Middleware pour collecter le temps de réponse moyen
function averageResponseTime(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    res.on("finish", () => {
        const duration = Date.now() - start;
        stats.averageResponseTime.totalTime += duration;
        stats.averageResponseTime.totalRequests++;
    });
    next();
}

// Middleware pour collecter le nombre de requêtes par code de statut HTTP
function statusCodesCount(req: Request, res: Response, next: NextFunction) {
    const oldSend = res.send.bind(res);
    res.send = function (data?: any) {
        stats.statusCodesCount[res.statusCode] = (stats.statusCodesCount[res.statusCode] ?? 0) + 1;
        return oldSend(data);
    };
    next();
}

// Middleware pour collecter la taille moyenne des réponses
function averageResponseSize(req: Request, res: Response, next: NextFunction) {
    const oldSend = res.send.bind(res);
    res.send = function (data?: any) {
        if (data) {
            const dataSize = JSON.stringify(data).length;
            stats.averageResponseSize.totalSize += dataSize;
            stats.averageResponseSize.totalRequests++;
        }
        return oldSend(data);
    };
    next();
}

// Middleware pour enregistrer les statistiques dans la base de données
function saveMetrics(req: Request, res: Response, next: NextFunction) {
    const { requestStats, averageResponseTime, statusCodesCount, averageResponseSize } = stats;
    prisma.stats_api
        .create({
            data: {
                totalRequests: requestStats.totalRequests,
                averageResponseTime: averageResponseTime.totalRequests !== 0
                    ? averageResponseTime.totalTime / averageResponseTime.totalRequests
                    : 0,
                statusCodeCounts: statusCodesCount,
                averageResponseSize: averageResponseSize.totalRequests !== 0
                    ? averageResponseSize.totalSize / averageResponseSize.totalRequests
                    : 0,
            },
        })
        .then(() => next())
        .catch((error: unknown) => {
            console.error("Error saving metrics:", error);
            next(error as Error);
        });
}

export { requestStats, averageResponseTime, statusCodesCount, averageResponseSize, saveMetrics };
export default {
    requestStats,
    averageResponseTime,
    statusCodesCount,
    averageResponseSize,
    saveMetrics,
};
