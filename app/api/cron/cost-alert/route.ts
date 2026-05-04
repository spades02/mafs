import { NextRequest, NextResponse } from "next/server";
import { rollingSpend } from "@/lib/weekly-sims/cost-monitor";
import { sendEmail } from "@/app/lib/email";

export const runtime = "nodejs";

/**
 * Daily LLM-spend alert. Sums spend over the trailing 7 days and emails
 * MAFS_ADMIN_EMAIL if it exceeds the soft target. No auto-pause — the
 * decision per the plan is to monitor only, not throttle.
 *
 * Soft target default: $250/week. Override with WEEKLY_LLM_SPEND_TARGET_USD.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const expected = process.env.CRON_SECRET;
  if (!expected || authHeader !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const target = Number(process.env.WEEKLY_LLM_SPEND_TARGET_USD ?? "250");
  const adminEmail = process.env.MAFS_ADMIN_EMAIL;
  const total = await rollingSpend(7);

  if (total <= target) {
    return NextResponse.json({ ok: true, total, target, alerted: false });
  }

  if (!adminEmail) {
    console.warn(`[cost-alert] spend $${total.toFixed(2)} > target $${target} but MAFS_ADMIN_EMAIL not set`);
    return NextResponse.json({ ok: true, total, target, alerted: false, note: "MAFS_ADMIN_EMAIL not set" });
  }

  await sendEmail({
    to: adminEmail,
    subject: `[MAFS] LLM weekly spend alert: $${total.toFixed(2)} (target $${target})`,
    html: `
      <p>The trailing-7-day LLM spend is <strong>$${total.toFixed(2)}</strong>, above the soft target of <strong>$${target.toFixed(2)}</strong>.</p>
      <p>This is informational — no automatic pause is in effect. Review <code>llm_spend_log</code> for breakdown.</p>
    `,
  });

  return NextResponse.json({ ok: true, total, target, alerted: true });
}
