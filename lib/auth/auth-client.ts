import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
    /** The base URL of the server (optional if you're using the same domain) */
    baseURL: process.env.BETTER_AUTH_URL,
    secret: process.env.BETTER_AUTH_SECRET,
});

export const {
    signIn,
    signUp,
    signOut,
    useSession,
    updateUser,
    changePassword,
} = authClient;