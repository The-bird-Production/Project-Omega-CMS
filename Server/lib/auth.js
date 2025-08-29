import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";

// Initialise Prisma
const prisma = new PrismaClient();

// Configure BetterAuth
export const auth = betterAuth({
  // Authentification email/mot de passe
  emailAndPassword: { enabled: true },
  trustedOrigins: ["http://localhost:3000", "http://localhost:3001"],

  // Adapter Prisma pour la base de données
  database: prismaAdapter(prisma, {
    provider: "mysql", // ou "sqlite" / "postgresql" selon ton setup
  }),
});
