import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";
import {admin as adminPlugins}  from "better-auth/plugins" 
import {ac,admin, user} from "./permissions.js"

// Initialise Prisma
const prisma = new PrismaClient();

// ALLOWED_ORIGINS accepts a comma-separated list (same variable used for CORS in config/server.js).
const trustedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:3000,http://localhost:3001")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// Configure BetterAuth
export const auth = betterAuth({
  // Authentification email/mot de passe
  emailAndPassword: { enabled: true },
  trustedOrigins,
  advanced: {
    // Cookies "secure" (HTTPS-only) dès qu'on tourne en production.
    useSecureCookies: process.env.NODE_ENV === "production",
  },

  // Adapter Prisma pour la base de données
  database: prismaAdapter(prisma, {
    provider: "mysql", // ou "sqlite" / "postgresql" selon ton setup
  }),
  plugins: [
    adminPlugins({
      ac,
      roles:{
        admin,
        user,
      }
    })
  ]
});
