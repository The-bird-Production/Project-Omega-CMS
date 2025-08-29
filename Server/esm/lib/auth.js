import { betterAuth } from "better-auth";
import prisma$0 from "better-auth/adapters/prisma";
import client from "@prisma/client";
const { prismaAdapter } = prisma$0;
const { PrismaClient } = client;
const prisma = new PrismaClient();
const auth = betterAuth({
    // Active l'authentification par email/mot de passe
    emailAndPassword: {
        enabled: true,
    },
    // Utilisation de Prisma pour la base de données
    database: prismaAdapter(prisma, {
        provider: "mysql", // ou "sqlite" / "postgresql" selon ton setup
    }),
});
export { auth };
export default {
    auth
};
