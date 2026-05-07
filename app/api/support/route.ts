import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { headers } from "next/headers";
import { db, supportMessages } from "@/db";
import { auth } from "@/app/lib/auth/auth";
import { sendEmail } from "@/app/lib/email";

export const runtime = "nodejs";

const ALLOWED_TYPES = new Set(["support", "feedback", "bug", "feature_request"]);
const MAX_SUBJECT_LEN = 200;
const MAX_BODY_LEN = 5_000;

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });

  let payload: { type?: string; subject?: string; body?: string; emailForReply?: string };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const type = String(payload.type ?? "").trim();
  const subject = String(payload.subject ?? "").trim();
  const body = String(payload.body ?? "").trim();
  const emailForReply = payload.emailForReply ? String(payload.emailForReply).trim() : null;

  if (!ALLOWED_TYPES.has(type)) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }
  if (!subject || subject.length > MAX_SUBJECT_LEN) {
    return NextResponse.json({ error: "Subject required (≤200 chars)" }, { status: 400 });
  }
  if (!body || body.length > MAX_BODY_LEN) {
    return NextResponse.json({ error: "Body required (≤5000 chars)" }, { status: 400 });
  }

  const userId = session?.user?.id ?? null;
  const userEmail = session?.user?.email ?? null;
  const replyEmail = emailForReply || userEmail;

  if (!replyEmail) {
    return NextResponse.json({ error: "Email required for reply" }, { status: 400 });
  }

  const id = nanoid();
  await db.insert(supportMessages).values({
    id,
    userId,
    type,
    subject,
    body,
    emailForReply: replyEmail,
  });

  // Forward to admin inbox if configured. Don't block the user response on
  // delivery — log + continue if Resend fails.
  const adminEmail = process.env.MAFS_ADMIN_EMAIL;
  if (adminEmail) {
    try {
      const isProTag = session?.user && (session.user as { isPro?: boolean }).isPro ? "Pro" : "Free";
      await sendEmail({
        to: adminEmail,
        subject: `[MAFS ${type}] ${subject}`,
        html: `
          <p><strong>From:</strong> ${replyEmail} (${isProTag})</p>
          <p><strong>Type:</strong> ${type}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <hr />
          <pre style="white-space: pre-wrap; font-family: inherit;">${escapeHtml(body)}</pre>
          <hr />
          <p style="color:#666;font-size:12px">Ticket ID: ${id}${userId ? ` · user_id: ${userId}` : " · guest"}</p>
        `,
      });
    } catch (err) {
      console.error("[support] failed to forward to admin:", err);
    }
  }

  return NextResponse.json({ ok: true, id });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
