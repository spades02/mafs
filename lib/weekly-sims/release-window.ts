/**
 * Gameplan release window — by default the weekly Gameplan is "in progress"
 * Wed–Fri while sims are still running, and "ready" from Friday 6pm ET
 * through Sunday end-of-card. The waiting screen renders during the build
 * window, the actual card UI takes over after release.
 */

const RELEASE_HOUR_UTC = 22; // 6pm ET (EDT) / 5pm ET (EST). Close enough.

/** Returns the next Friday RELEASE_HOUR_UTC after `from`. */
export function nextFridayRelease(from: Date = new Date()): Date {
  const d = new Date(from);
  // 0=Sun, 5=Fri, 6=Sat
  const day = d.getUTCDay();
  let delta = (5 - day + 7) % 7;
  // If today is Friday and we're already past release-hour, push to next Friday.
  if (delta === 0 && d.getUTCHours() >= RELEASE_HOUR_UTC) delta = 7;
  d.setUTCDate(d.getUTCDate() + delta);
  d.setUTCHours(RELEASE_HOUR_UTC, 0, 0, 0);
  return d;
}

/** True when the most recent Friday release-time is in the past (Fri 6pm ET → Mon). */
export function isReleaseLive(now: Date = new Date()): boolean {
  const day = now.getUTCDay();
  const hr = now.getUTCHours();
  // Sun (0), Sat (6) — released
  if (day === 6 || day === 0) return true;
  // Fri after release hour — released
  if (day === 5 && hr >= RELEASE_HOUR_UTC) return true;
  // Mon morning <12 UTC — still inside the post-event window for late settlement
  if (day === 1 && hr < 12) return true;
  return false;
}

export function msUntilNextRelease(from: Date = new Date()): number {
  return Math.max(0, nextFridayRelease(from).getTime() - from.getTime());
}
