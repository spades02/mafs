/**
 * Retention email templates. Three variants:
 *   1. weekly-card-teaser  — to all free users, every Wed
 *   2. limit-hit-nudge     — users who hit lifetime 3-pick cap
 *   3. inactive-7d         — users not seen in ≥7 days
 *
 * Each template returns { subject, html }. Body is plain HTML — Resend
 * accepts that directly. Keep it minimal: one CTA, one pick highlight,
 * one upgrade link.
 *
 * The `pick` shape is whatever recurring_edges row we picked as "the
 * strongest of the week". The `freePickUrl` is the HMAC-signed token
 * page on /free-pick/[token].
 */

export type RetentionPick = {
  label: string;
  betType: string;
  appearancePct: number;
  avgEdge: number;
  latestMarketOdd: number | null;
};

export type RetentionTemplateInput = {
  recipientName: string | null;
  pick: RetentionPick;
  freePickUrl: string;
  upgradeUrl: string;
  appBaseUrl: string;
};

const PRIMARY = "#05EA78";

function picCard(pick: RetentionPick): string {
  const pct = Math.round(pick.appearancePct * 100);
  const edge = `${pick.avgEdge >= 0 ? "+" : ""}${pick.avgEdge.toFixed(1)}%`;
  const market =
    pick.latestMarketOdd != null
      ? (pick.latestMarketOdd > 0 ? `+${pick.latestMarketOdd}` : `${pick.latestMarketOdd}`)
      : "—";

  return `
    <div style="border:1px solid #1f2937;background:#0F1117;border-radius:12px;padding:24px;margin:20px 0;">
      <div style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:${PRIMARY};font-weight:600;">
        Top recurring edge
      </div>
      <div style="font-size:24px;font-weight:700;color:#fff;margin-top:8px;">${escapeHtml(pick.label)}</div>
      <div style="margin-top:16px;display:table;width:100%;table-layout:fixed;">
        <div style="display:table-cell;text-align:center;padding:8px;border:1px solid #1f2937;border-radius:6px;">
          <div style="font-size:24px;font-weight:700;color:${PRIMARY};">${pct}%</div>
          <div style="font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:#6b7280;">Sim freq</div>
        </div>
        <div style="display:table-cell;width:8px;"></div>
        <div style="display:table-cell;text-align:center;padding:8px;border:1px solid #1f2937;border-radius:6px;">
          <div style="font-size:24px;font-weight:700;color:#34d399;">${edge}</div>
          <div style="font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:#6b7280;">Avg edge</div>
        </div>
        <div style="display:table-cell;width:8px;"></div>
        <div style="display:table-cell;text-align:center;padding:8px;border:1px solid #1f2937;border-radius:6px;">
          <div style="font-size:24px;font-weight:700;color:#fff;">${market}</div>
          <div style="font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:#6b7280;">Market</div>
        </div>
      </div>
    </div>
  `;
}

function shell(title: string, bodyHtml: string, ctaHref: string, ctaLabel: string, appBaseUrl: string): string {
  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0A0C10;color:#E5E7EB;max-width:600px;margin:0 auto;padding:32px 16px;">
      <div style="text-align:center;margin-bottom:24px;">
        <span style="display:inline-block;font-size:14px;letter-spacing:0.18em;text-transform:uppercase;color:${PRIMARY};font-weight:700;">MAFS</span>
      </div>
      <h1 style="font-size:24px;font-weight:700;color:#fff;margin:0 0 8px;">${escapeHtml(title)}</h1>
      ${bodyHtml}
      <div style="text-align:center;margin:24px 0;">
        <a href="${ctaHref}" style="display:inline-block;background:${PRIMARY};color:#000;padding:14px 28px;text-decoration:none;border-radius:8px;font-weight:700;">
          ${escapeHtml(ctaLabel)}
        </a>
      </div>
      <p style="font-size:12px;color:#6b7280;text-align:center;margin-top:32px;">
        Sent by MAFS. <a href="${appBaseUrl}/settings" style="color:#6b7280;">Manage notifications</a>
      </p>
    </div>
  `;
}

export function weeklyCardTeaser(input: RetentionTemplateInput): { subject: string; html: string } {
  const greeting = input.recipientName ? `Hey ${escapeHtml(input.recipientName)},` : "Hey,";
  const subject = `This week's MAFS pick — ${input.pick.label}`;
  const html = shell(
    "This week's free MAFS pick is ready",
    `
      <p style="color:#9ca3af;line-height:1.6;">${greeting} every Wednesday we run hundreds of simulations across the upcoming UFC card. Here's the strongest recurring edge from this week's batch.</p>
      ${picCard(input.pick)}
      <p style="color:#9ca3af;font-size:13px;line-height:1.6;">
        Want the full card with parlays sized to your risk tolerance?
      </p>
    `,
    input.freePickUrl,
    "View this pick",
    input.appBaseUrl,
  );
  return { subject, html };
}

export function limitHitNudge(input: RetentionTemplateInput): { subject: string; html: string } {
  const subject = `You used your 3 free picks — here's this week's strongest edge`;
  const html = shell(
    "Your free trial is done. The picks aren't.",
    `
      <p style="color:#9ca3af;line-height:1.6;">You've used your 3 free MAFS premium picks. As a thank-you for trying it, here's one more — the strongest recurring edge we found this week across hundreds of simulations.</p>
      ${picCard(input.pick)}
      <p style="color:#9ca3af;font-size:13px;line-height:1.6;">
        Pro unlocks the rest of the card, parlays sized to your risk tier, and weekly drops without the cap.
      </p>
    `,
    input.freePickUrl,
    "View this week's pick",
    input.appBaseUrl,
  );
  return { subject, html };
}

export function inactive7d(input: RetentionTemplateInput): { subject: string; html: string } {
  const subject = `MAFS detected one of the strongest edges of the week`;
  const html = shell(
    "We found a strong edge this week",
    `
      <p style="color:#9ca3af;line-height:1.6;">It's been a minute. We just finished this week's simulation runs across the upcoming UFC card and one pick stood out.</p>
      ${picCard(input.pick)}
      <p style="color:#9ca3af;font-size:13px;line-height:1.6;">
        Tap below to see the full breakdown — no login required.
      </p>
    `,
    input.freePickUrl,
    "See this week's pick",
    input.appBaseUrl,
  );
  return { subject, html };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
