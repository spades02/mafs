
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db/db"; // your drizzle instance
import * as schema from "@/db/schema/auth-schema";
import { sendEmail } from "../email";

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
                input: false // Don't allow user to set this
            },
        },
    },
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
        sendResetPassword: async ({ user, url }) => {
            await sendEmail({
                to: user.email,
                subject: "Reset your password - MAFS",
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                        <h1 style="color: #05EA78;">Reset Password</h1>
                        <p>We received a request to reset your password. Click the link below to proceed:</p>
                        <a href="${url}" style="display:inline-block;background:#05EA78;color:black;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;margin: 20px 0;">Reset Password</a>
                        <p>If the button doesn't work, copy and paste this link:</p>
                        <p style="color: #666; word-break: break-all;">${url}</p>
                        <p style="margin-top: 40px; font-size: 12px; color: #888;">If you didn't request this, you can safely ignore this email.</p>
                    </div>
                `,
            });
        },
    },
    emailVerification: {
        sendOnSignUp: true,
        sendVerificationEmail: async ({ user, url }) => {
            await sendEmail({
                to: user.email,
                subject: "Verify your email address - MAFS",
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                        <h1 style="color: #05EA78;">Welcome to MAFS!</h1>
                        <p>Click the link below to verify your email address and activate your account:</p>
                        <a href="${url}" style="display:inline-block;background:#05EA78;color:black;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;margin: 20px 0;">Verify Email</a>
                        <p>If the button doesn't work, copy and paste this link:</p>
                        <p style="color: #666; word-break: break-all;">${url}</p>
                    </div>
                `,
            });
        },
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