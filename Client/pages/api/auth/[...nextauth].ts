import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth, { NextAuthOptions } from "next-auth";
import { Adapter } from "next-auth/adapters";
import GithubProvider from "next-auth/providers/github";
import { prisma } from "../../../lib/prisma";


export const authConfig = {
    providers: [
        GithubProvider({
            clientId: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET,
        })
    ],
    adapter: PrismaAdapter(prisma) as Adapter,
    callbacks: {
        async session({ session, user }) {

            session.user.id = user.id;
            session.user.roleId = user.roleId
            return session;
        },
        
        
    }
} satisfies NextAuthOptions

export default NextAuth(authConfig)