import {createAuthClient} from "better-auth/react"

export const authClient = createAuthClient({
    baseURL: "http://localhost:3001/api/auth/", //Base URL of your app
})

export const {
    signIn,
    signOut,
    signUp,
    useSession
} = authClient;