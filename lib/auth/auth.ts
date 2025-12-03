import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db/db"; // your drizzle instance
import * as schema from "@/db/schema/auth-schema"

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg", // or "mysql", "sqlite"
        schema,
    }),
    emailAndPassword: {
        enabled: true,
        // sendResetPassword: async ({ user, url }) => {
        //     // Send email with reset link
        //     await sendEmail({
        //       to: user.email,
        //       subject: "Reset your password",
        //       text: `Click the link to reset your password: ${url}`,
        //     });
        //   },
        //   onPasswordReset: async ({ user }, request) => {
        //     // your logic here
        //     console.log(`Password for user ${user.email} has been reset.`);
        //   },
    },
    socialProviders: {
         google: {
            enabled: true,
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!
         },
    },
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;