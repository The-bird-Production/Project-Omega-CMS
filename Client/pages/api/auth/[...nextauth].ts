import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth, { NextAuthOptions } from "next-auth";
import { Adapter } from "next-auth/adapters";
import GithubProvider from "next-auth/providers/github";
import { prisma } from "../../../lib/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import jsonwebtoken from "jsonwebtoken"





export const authConfig = {
    providers: [
      GithubProvider({
        clientId: process.env.GITHUB_ID,
        clientSecret: process.env.GITHUB_SECRET,
      }),
      CredentialsProvider({
        // The name to display on the sign in form (e.g. 'Sign in with...')
        name: 'Credentials',
        // The credentials is used to generate a suitable form on the sign in page.
        // You can specify whatever fields you are expecting to be submitted.
        // e.g. domain, username, password, 2FA token, etc.
        // You can pass any HTML attribute to the <input> tag through the object.
        credentials: {
          email: { label: "Email", type: "email", placeholder: "jsmith@exemple.com" },
          password: { label: "Password", type: "password" }
        },
        async authorize(credentials, req) {
          // You need to provide your own logic here that takes the credentials
          // submitted and returns either a object representing a user or value
          // that is false/null if the credentials are invalid.
          // e.g. return { id: 1, name: 'J Smith', email: 'jsmith@example.com' }
          // You can also use the `req` object to obtain additional parameters
          // (i.e., the request IP address)
          const res = await fetch("http://localhost:3001/auth/login", {
            method: 'POST',
            body: JSON.stringify(credentials),
            headers: { "Content-Type": "application/json" }
          })
          
          const response = await res.json()
          const user = response.user;
          // If no error and we have user data, return it
          if (res.ok && user) {
            return user
          }
          // Return null if user data could not be retrieved
          return null
        }
      })
    ],
    session: {
      strategy: 'jwt',
    },
    adapter: PrismaAdapter(prisma),
    callbacks: {
      async jwt({ token, user, account, profile }) {
        if (user) {
          token.user = {
            id: user.id,
            username: user.username,
            email: user.email,
            roleId: user.roleId,
            avatar: profile?.picture || user.image,
            accessToken: await jsonwebtoken.sign({user}, process.env.JWT_SECRET)

          };
        }
        
        
        return token;
      },
      async session({ session, token }) {
        
        session.user = token.user;
        session.accessToken = token.user.acessToken ;
        
        
        
        return session;
      },
    },
  } satisfies NextAuthOptions

export default NextAuth(authConfig)