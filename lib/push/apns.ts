import { eq, and } from "drizzle-orm";
import { db, deviceTokens, user } from "@/db";

/**
 * Server-side APNs sender. Loads `@parse/node-apn` lazily so dev
 * environments without APNs env vars don't crash on import.
 *
 * Usage:
 *   await sendPushToUser(userId, { title, body, url? });
 *   await sendPushToAllOptedIn({ title, body, url? });
 *
 * Stale-token cleanup: any (token, status=410|BadDeviceToken) failure
 * deletes that row from device_tokens. Apple recycles tokens, and
 * uninstall/reinstall on the same device can produce a new token —
 * old ones must be evicted.
 */

export type PushPayload = {
  title: string;
  body: string;
  /** Optional deep-link path (e.g. /weekly-card). Forwarded as `url` in custom data. */
  url?: string;
};

let providerCache: import("@parse/node-apn").Provider | null = null;

function getProvider() {
  if (providerCache) return providerCache;

  const keyId = process.env.APNS_KEY_ID;
  const teamId = process.env.APNS_TEAM_ID;
  const keyP8 = process.env.APNS_KEY_P8;
  if (!keyId || !teamId || !keyP8) {
    throw new Error(
      "APNs not configured — set APNS_KEY_ID, APNS_TEAM_ID, APNS_KEY_P8 (raw .p8 contents)",
    );
  }

  // Lazy require so the lib doesn't blow up if not installed yet.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const apn = require("@parse/node-apn") as typeof import("@parse/node-apn");
  providerCache = new apn.Provider({
    token: { key: keyP8, keyId, teamId },
    production: process.env.APNS_PRODUCTION === "true",
  });
  return providerCache;
}

async function sendToTokens(tokens: string[], payload: PushPayload): Promise<{ sent: number; failed: number }> {
  if (tokens.length === 0) return { sent: 0, failed: 0 };

  const provider = getProvider();
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const apn = require("@parse/node-apn") as typeof import("@parse/node-apn");
  const note = new apn.Notification();
  note.alert = { title: payload.title, body: payload.body };
  note.topic = process.env.APNS_BUNDLE_ID ?? "ai.mafs.app";
  note.sound = "default";
  note.contentAvailable = true;
  if (payload.url) note.payload = { url: payload.url };

  const result = await provider.send(note, tokens);

  // Stale-token cleanup
  for (const failure of result.failed ?? []) {
    const reason = failure?.response?.reason;
    const status = failure?.status;
    if (status === "410" || reason === "BadDeviceToken" || reason === "Unregistered") {
      await db.delete(deviceTokens).where(eq(deviceTokens.token, failure.device)).catch(() => {});
    } else {
      console.warn(`[apns] send failed token=${failure.device} reason=${reason ?? status}`);
    }
  }

  return { sent: result.sent?.length ?? 0, failed: result.failed?.length ?? 0 };
}

/** Send a push to one user (across all their device tokens). */
export async function sendPushToUser(userId: string, payload: PushPayload): Promise<{ sent: number; failed: number }> {
  const rows = await db
    .select({ token: deviceTokens.token })
    .from(deviceTokens)
    .innerJoin(user, eq(user.id, deviceTokens.userId))
    .where(and(eq(deviceTokens.userId, userId), eq(deviceTokens.platform, "apns"), eq(user.pushNotificationsOptIn, true)));
  return sendToTokens(rows.map((r) => r.token), payload);
}

/** Fan-out send to every opted-in user. Used by the weekly-card-ready trigger. */
export async function sendPushToAllOptedIn(payload: PushPayload): Promise<{ sent: number; failed: number; tokens: number }> {
  const rows = await db
    .select({ token: deviceTokens.token })
    .from(deviceTokens)
    .innerJoin(user, eq(user.id, deviceTokens.userId))
    .where(and(eq(deviceTokens.platform, "apns"), eq(user.pushNotificationsOptIn, true)));
  const result = await sendToTokens(rows.map((r) => r.token), payload);
  return { ...result, tokens: rows.length };
}
