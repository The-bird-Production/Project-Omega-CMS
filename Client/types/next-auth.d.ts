import { DefaultSession } from "next-auth";
import { JsonValue } from "next-auth/adapters";


declare module "next-auth" {
    interface Session {
        user: User & DefaultSession["user"]
        permissions : object | JsonValue | undefined

    }

    interface User {
        roleId: string | null,
        id: string
    }

    
}