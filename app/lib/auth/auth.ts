
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db/db"; // your drizzle instance
import * as schema from "@/db/schema/auth-schema";

export const auth = betterAuth({
    trustedOrigins: [
        process.env.BETTER_AUTH_URL as string,
    ],
    database: drizzleAdapter(db, {
        provider: "pg", // or "mysql", "sqlite"
        schema,
    }),
    user: {
        additionalFields: {
            stripeCustomerId: {
                type: "string",
                required: false,
            },
            stripeSubscriptionId: {
                type: "string",
                required: false,
            },
            subscriptionStatus: {
                type: "string",
                required: false,
            },
            isPro: {
                type: "boolean",
                required: true,
                defaultValue: false,
            },
            analysisCount: {
                type: "number",
                required: true,
                defaultValue: 0,
            },
        },
    },
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
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string
         },
    },
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;