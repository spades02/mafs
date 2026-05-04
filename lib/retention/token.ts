import { createHmac, timingSafeEqual } from "crypto";

/**
 * HMAC-signed free-pick tokens. The token is a base64url string of
 * `{payload}.{sig}` where payload encodes:
 *   { uid, eid, fid, bt, lbl, exp }
 * and sig = HMAC-SHA256(secret, payload).
 *
 * Tokens are stateless — no DB table. The /free-pick page validates the
 * sig + exp and renders the named edge from the recurring_edges table.
 *
 * Secret: REFERRAL_TOKEN_SECRET (or FREE_PICK_TOKEN_SECRET; we accept
 * either for symmetry with other secrets — pick one and stick with it).
 */
type FreePickPayload = {
  uid: string;
  eid: string;
  fid: string;
  bt: string;
  lbl: string;
  exp: number; // Unix seconds
};

function getSecret(): string {
  const s = process.env.FREE_PICK_TOKEN_SECRET ?? process.env.CRON_SECRET;
  if (!s) {
    throw new Error("FREE_PICK_TOKEN_SECRET (or CRON_SECRET) must be set");
  }
  return s;
}

function b64url(buf: Buffer | string): string {
  const b = Buffer.isBuffer(buf) ? buf : Buffer.from(buf);
  return b.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64url(s: string): Buffer {
  const padded = s.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (s.length % 4)) % 4);
  return Buffer.from(padded, "base64");
}

export function signFreePickToken(payload: Omit<FreePickPayload, "exp">, ttlSec = 14 * 24 * 60 * 60): string {
  const full: FreePickPayload = { ...payload, exp: Math.floor(Date.now() / 1000) + ttlSec };
  const body = b64url(JSON.stringify(full));
  const sig = b64url(createHmac("sha256", getSecret()).update(body).digest());
  return `${body}.${sig}`;
}

export function verifyFreePickToken(token: string): FreePickPayload | null {
  if (typeof token !== "string" || !token.includes(".")) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;

  const expected = createHmac("sha256", getSecret()).update(body).digest();
  let actual: Buffer;
  try {
    actual = fromB64url(sig);
  } catch {
    return null;
  }
  if (expected.length !== actual.length) return null;
  if (!timingSafeEqual(expected, actual)) return null;

  let payload: FreePickPayload;
  try {
    payload = JSON.parse(fromB64url(body).toString("utf8")) as FreePickPayload;
  } catch {
    return null;
  }
  if (typeof payload.exp !== "number" || payload.exp < Math.floor(Date.now() / 1000)) return null;
  return payload;
}
