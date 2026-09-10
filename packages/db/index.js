import { PrismaClient } from "@prisma/client";

// Shared singleton so every app/function reuses the same connection pool
// instead of each file opening its own PrismaClient (and its own pool).
const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.__omegaPrisma ??
  new PrismaClient(process.env.PRISMA_LOG_QUERIES === "true" ? { log: ["query"] } : undefined);

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__omegaPrisma = prisma;
}

export * from "@prisma/client";
export default prisma;
