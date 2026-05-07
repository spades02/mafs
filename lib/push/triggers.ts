import { sendPushToAllOptedIn } from "./apns";

/**
 * Fired when the Phase 3 weekly-card builder finishes generating cards
 * for an event. Sends a single push to all opted-in users.
 *
 * Best-effort — failure here must NOT roll back the card generation.
 */
export async function notifyWeeklyCardReady(eventName: string): Promise<void> {
  try {
    const result = await sendPushToAllOptedIn({
      title: "This week's MAFS picks are ready",
      body: `Open MAFS to see the ${eventName} card.`,
      url: "/weekly-card",
    });
    console.log(`[push] weekly-card-ready: sent=${result.sent} failed=${result.failed} tokens=${result.tokens}`);
  } catch (err) {
    console.error("[push] notifyWeeklyCardReady failed:", err);
  }
}
