const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Création d'un objet global pour stocker les statistiques
const stats = {
  requestStats: { totalRequests: 0 },
  averageResponseTime: { totalTime: 0, totalRequests: 0 },
  statusCodesCount: { 200: 0, 400: 0, 404: 0, 500: 0 },
  averageResponseSize: { totalSize: 0, totalRequests: 0 },
};

// Middleware pour collecter les statistiques des requêtes entrantes
function requestStats(req, res, next) {
  stats.requestStats.totalRequests++;
  next();
}

// Middleware pour collecter le temps de réponse moyen
function averageResponseTime(req, res, next) {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    stats.averageResponseTime.totalTime += duration;
    stats.averageResponseTime.totalRequests++;
  });
  next();
}

// Middleware pour collecter le nombre de requêtes par code de statut HTTP
function statusCodesCount(req, res, next) {
  const oldSend = res.send;
  res.send = function (data) {
    stats.statusCodesCount[res.statusCode]++;
    oldSend.apply(res, arguments);
  };
  next();
}

// Middleware pour collecter la taille moyenne des réponses
function averageResponseSize(req, res, next) {
  const oldSend = res.send;
  res.send = function (data) {
    if (data) {
      const dataSize = JSON.stringify(data).length;
      stats.averageResponseSize.totalSize += dataSize;
      stats.averageResponseSize.totalRequests++;
    }
    oldSend.apply(res, arguments);
  };
  next();
}

// Middleware pour enregistrer les statistiques dans la base de données
function saveMetrics(req, res, next) {
  const {
    requestStats,
    averageResponseTime,
    statusCodesCount,
    averageResponseSize,
  } = stats;

  prisma.stats_Api
    .create({
      data: {
        totalRequests: requestStats.totalRequests,
        averageResponseTime:
          averageResponseTime.totalRequests !== 0
            ? averageResponseTime.totalTime / averageResponseTime.totalRequests
            : 0,
        statusCodeCounts: statusCodesCount,
        averageResponseSize:
          averageResponseSize.totalRequests !== 0
            ? averageResponseSize.totalSize / averageResponseSize.totalRequests
            : 0,
      },
    })
    .then(() => next())
    .catch((error) => {
      console.error("Error saving metrics:", error);
      next(error);
    });
}

module.exports = {
  requestStats,
  averageResponseTime,
  statusCodesCount,
  averageResponseSize,
  saveMetrics,
};
