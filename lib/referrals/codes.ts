import { db, user } from "@/db";
import { eq } from "drizzle-orm";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // unambiguous: no 0/O, 1/I, etc.
const CODE_LEN = 8;
const COOKIE_NAME = "mafs_ref";
const COOKIE_MAX_AGE_SEC = 30 * 24 * 60 * 60; // 30 days

function randomCode(len = CODE_LEN): string {
  let out = "";
  for (let i = 0; i < len; i++) {
    out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return out;
}

/**
 * Generate a unique referral code, retrying on collision. Collisions are
 * vanishingly rare at 32^8 ≈ 1 trillion combinations, but we loop just
 * in case.
 */
export async function generateUniqueReferralCode(maxAttempts = 8): Promise<string> {
  for (let i = 0; i < maxAttempts; i++) {
    const code = randomCode();
    const [existing] = await db.select({ id: user.id }).from(user).where(eq(user.referralCode, code)).limit(1);
    if (!existing) return code;
  }
  throw new Error("Failed to generate unique referral code after " + maxAttempts + " attempts");
}

export const REFERRAL_COOKIE_NAME = COOKIE_NAME;
export const REFERRAL_COOKIE_MAX_AGE_SEC = COOKIE_MAX_AGE_SEC;

/**
 * Validate a referral code format — uppercase A-Z (minus ambiguous) + digits 2-9.
 * Used before any DB lookup to avoid wasted queries on garbage input.
 */
export function isValidCodeFormat(code: string): boolean {
  if (typeof code !== "string" || code.length !== CODE_LEN) return false;
  return [...code].every((c) => ALPHABET.includes(c));
}
