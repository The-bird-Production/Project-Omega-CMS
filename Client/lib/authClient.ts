import {createAuthClient} from "better-auth/react"
import {adminClient} from "better-auth/client/plugins"
import {ac, admin, user} from "./permissions"

export const authClient = createAuthClient({
    baseURL: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/`, //Base URL of your app
    plugins: [
        adminClient({
            ac,
            roles: {
                admin,
                user
            }
        })
    ]
})

export const {
    signIn,
    signOut,
    signUp,
    useSession
} = authClient;