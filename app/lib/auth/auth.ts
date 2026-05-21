
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db/db"; // your drizzle instance
import * as schema from "@/db/schema/auth-schema";
import { user as userTable } from "@/db/schema/auth-schema";
import { eq } from "drizzle-orm";
import { sendEmail } from "../email";
import { generateUniqueReferralCode } from "@/lib/referrals/codes";
import { supabaseServer } from "@/lib/supabase/server";

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
            rcCustomerId: {
                type: "string",
                required: false,
            },
            subscriptionPlatform: {
                type: "string",
                required: false,
            },
            subscriptionExpiresAt: {
                type: "date",
                required: false,
            },
            isPro: {
                type: "boolean",
                required: true,
                defaultValue: false,
            },
            isElite: {
                type: "boolean",
                required: true,
                defaultValue: false,
            },
            subscriptionTier: {
                type: "string",
                required: true,
                defaultValue: "free",
                input: false,
            },
            analysisCount: {
                type: "number",
                required: true,
                defaultValue: 0,
                input: false // Don't allow user to set this
            },
            foundingMember: {
                type: "boolean",
                required: true,
                defaultValue: false,
                input: false,
            },
            weeklyFreePickUsedAt: {
                type: "date",
                required: false,
                input: false,
            },
            referralCode: {
                type: "string",
                required: false,
                input: false, // server-generated only
            },
            referredByCode: {
                type: "string",
                required: false,
                input: false, // captured server-side from cookie via /api/referrals/attach
            },
        },
        // In-app account deletion — required by App Store Guideline 5.1.1(v).
        // Immediate, permanent delete (not deactivation). The user row cascade-deletes
        // all linked rows (sessions, accounts, saved plays, device tokens, referrals,
        // analysis runs). beforeDelete also clears the avatar from Supabase storage.
        deleteUser: {
            enabled: true,
            beforeDelete: async (userToDelete) => {
                try {
                    await supabaseServer.storage
                        .from("avatars")
                        .remove([`user_${userToDelete.id}/avatar.webp`]);
                } catch (err) {
                    console.error("[auth] failed to remove avatar on account deletion for", userToDelete.id, err);
                }
            },
        },
    },
    databaseHooks: {
        user: {
            create: {
                after: async (createdUser) => {
                    // Generate a unique referral code for every new user.
                    // Idempotent — re-runs are safe (existing code wins via unique
                    // constraint on subsequent UPDATEs that we never issue).
                    try {
                        const code = await generateUniqueReferralCode();
                        await db
                            .update(userTable)
                            .set({ referralCode: code, lastLoginAt: new Date() })
                            .where(eq(userTable.id, createdUser.id));
                    } catch (err) {
                        console.error("[auth] failed to generate referralCode for", createdUser.id, err);
                    }
                },
            },
        },
        session: {
            create: {
                after: async (session) => {
                    // Bump last_login_at on each new session (login). Best-effort.
                    try {
                        await db
                            .update(userTable)
                            .set({ lastLoginAt: new Date() })
                            .where(eq(userTable.id, session.userId));
                    } catch (err) {
                        console.error("[auth] failed to bump lastLoginAt for", session.userId, err);
                    }
                },
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
        // Sign in with Apple — required by App Store Guideline 4.8.
        // Ready-to-activate: registers automatically once the Apple credentials
        // are present in env (see CLIENT_APP_STORE_GUIDE.md → step C4).
        // - iOS uses the NATIVE flow (idToken), whose audience is the app bundle id.
        // - Web uses the Services ID (clientId) + a generated clientSecret JWT.
        // We accept both audiences so either path verifies.
        ...((process.env.APPLE_CLIENT_ID || process.env.APPLE_APP_BUNDLE_IDENTIFIER)
            ? {
                apple: {
                    clientId: (process.env.APPLE_CLIENT_ID ?? process.env.APPLE_APP_BUNDLE_IDENTIFIER) as string,
                    clientSecret: process.env.APPLE_CLIENT_SECRET ?? "",
                    appBundleIdentifier: process.env.APPLE_APP_BUNDLE_IDENTIFIER,
                    audience: [process.env.APPLE_CLIENT_ID, process.env.APPLE_APP_BUNDLE_IDENTIFIER].filter(Boolean) as string[],
                },
            }
            : {}),
    },
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;