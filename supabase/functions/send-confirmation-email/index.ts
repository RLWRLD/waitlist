import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Sender config — update after domain verification (Step 2/3)
const FROM_EMAIL = "RLDX by RLWRLD <launch@rlwrld.ai>";
const REPLY_TO = "do-not-reply@rlwrld.ai";

interface WaitlistRecord {
  id: number;
  email: string;
  full_name: string | null;
  organization: string | null;
  country: string | null;
  created_at: string;
}

function buildHtml(record: WaitlistRecord): string {
  const name = record.full_name || "there";
  const number = record.id;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="dark">
  <meta name="supported-color-schemes" content="dark">
  <title>Welcome to RLDX</title>
</head>
<body style="margin:0; padding:0; background-color:#0a0a0a; font-family:Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; -webkit-font-smoothing:antialiased;">

  <div style="display:none; max-height:0; overflow:hidden; font-size:1px; line-height:1px; color:#0a0a0a;">
    You're #${number} on the RLDX Launch List. Here's what happens next.
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#0a0a0a; padding:0;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="560" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px; width:100%;">

          <tr>
            <td style="padding-bottom:32px; text-align:center;">
              <span style="color:#50EACE; font-size:22px; font-weight:800; letter-spacing:1.5px;">RLDX</span>
            </td>
          </tr>

          <tr>
            <td style="background-color:#141414; border:1px solid #2a2a2a; border-radius:8px; padding:44px 40px;">

              <p style="color:#e8e8e8; font-size:22px; font-weight:600; margin:0 0 8px 0; line-height:1.3;">
                Hi ${name},
              </p>

              <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 28px 0;">
                <tr>
                  <td style="background-color:rgba(80,234,206,0.1); border:1px solid rgba(80,234,206,0.25); border-radius:20px; padding:6px 16px;">
                    <span style="color:#50EACE; font-size:14px; font-weight:600;">
                      Launch List #${number}
                    </span>
                  </td>
                </tr>
              </table>

              <p style="color:#b8b8b8; font-size:15px; line-height:1.75; margin:0 0 24px 0;">
                Welcome to the RLDX Launch List. RLDX is a <strong style="color:#e8e8e8;">Vision-Language-Action foundation model</strong> built for real-world dexterous manipulation — pick, place, assemble, tool-use, and beyond. We're building it in the open, and you're now part of that journey.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 24px 0;">
                <tr><td style="border-top:1px solid #2a2a2a;"></td></tr>
              </table>

              <p style="color:#e8e8e8; font-size:15px; font-weight:600; margin:0 0 14px 0;">
                What you signed up for
              </p>

              <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 28px 0; width:100%;">
                <tr>
                  <td style="padding:8px 0; vertical-align:top; width:28px;">
                    <span style="color:#50EACE; font-size:16px;">&#10003;</span>
                  </td>
                  <td style="color:#b8b8b8; font-size:14px; line-height:1.6; padding:8px 0;">
                    <strong style="color:#e8e8e8;">Early access</strong> to RLDX when it launches
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0; vertical-align:top; width:28px;">
                    <span style="color:#50EACE; font-size:16px;">&#10003;</span>
                  </td>
                  <td style="color:#b8b8b8; font-size:14px; line-height:1.6; padding:8px 0;">
                    <strong style="color:#e8e8e8;">Priority updates</strong> on benchmarks, demos, and release milestones
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0; vertical-align:top; width:28px;">
                    <span style="color:#50EACE; font-size:16px;">&#10003;</span>
                  </td>
                  <td style="color:#b8b8b8; font-size:14px; line-height:1.6; padding:8px 0;">
                    <strong style="color:#e8e8e8;">Launch event invitations</strong> — San Francisco · Tokyo · Seoul, Q2 2026
                  </td>
                </tr>
              </table>

              <p style="color:#e8e8e8; font-size:15px; font-weight:600; margin:0 0 14px 0;">
                What happens next
              </p>

              <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 28px 0; width:100%;">
                <tr>
                  <td style="vertical-align:top; width:28px; padding:8px 0;">
                    <table cellpadding="0" cellspacing="0" role="presentation">
                      <tr>
                        <td style="background-color:rgba(80,234,206,0.15); border-radius:50%; width:22px; height:22px; text-align:center; line-height:22px;">
                          <span style="color:#50EACE; font-size:12px; font-weight:600;">1</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td style="color:#b8b8b8; font-size:14px; line-height:1.6; padding:8px 0;">
                    We're onboarding the launch list in waves.
                  </td>
                </tr>
                <tr>
                  <td style="vertical-align:top; width:28px; padding:8px 0;">
                    <table cellpadding="0" cellspacing="0" role="presentation">
                      <tr>
                        <td style="background-color:rgba(80,234,206,0.15); border-radius:50%; width:22px; height:22px; text-align:center; line-height:22px;">
                          <span style="color:#50EACE; font-size:12px; font-weight:600;">2</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td style="color:#b8b8b8; font-size:14px; line-height:1.6; padding:8px 0;">
                    You'll get a separate email when your access is ready.
                  </td>
                </tr>
                <tr>
                  <td style="vertical-align:top; width:28px; padding:8px 0;">
                    <table cellpadding="0" cellspacing="0" role="presentation">
                      <tr>
                        <td style="background-color:rgba(80,234,206,0.15); border-radius:50%; width:22px; height:22px; text-align:center; line-height:22px;">
                          <span style="color:#50EACE; font-size:12px; font-weight:600;">3</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td style="color:#b8b8b8; font-size:14px; line-height:1.6; padding:8px 0;">
                    Until then, major updates only — no spam.
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 24px 0;">
                <tr><td style="border-top:1px solid #2a2a2a;"></td></tr>
              </table>

              <p style="color:#b8b8b8; font-size:15px; line-height:1.75; margin:0 0 28px 0;">
                Thank you for your interest in RLDX.
              </p>

              <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 auto 0 auto;">
                <tr>
                  <td align="center" style="background-color:#50EACE; border-radius:8px;">
                    <a href="https://rlwrld.ai" style="display:inline-block; padding:14px 32px; color:#0a0a0a; font-size:14px; font-weight:600; text-decoration:none; letter-spacing:0.3px;">
                      Visit RLWRLD.ai
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <tr>
            <td style="padding:32px 0 0 0; text-align:center;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 20px 0;">
                <tr><td style="border-top:1px solid #1a1a1a;"></td></tr>
              </table>
              <p style="margin:0 0 16px 0;">
                <a href="https://x.com/RLWRLD_ai" style="color:#8a8a8a; font-size:12px; text-decoration:none;">X</a>
                &nbsp;&nbsp;<span style="color:#333;">&middot;</span>&nbsp;&nbsp;
                <a href="https://www.linkedin.com/company/rlwrld/" style="color:#8a8a8a; font-size:12px; text-decoration:none;">LinkedIn</a>
                &nbsp;&nbsp;<span style="color:#333;">&middot;</span>&nbsp;&nbsp;
                <a href="https://www.youtube.com/@rlwrld.dexterity" style="color:#8a8a8a; font-size:12px; text-decoration:none;">YouTube</a>
              </p>
              <p style="margin:0 0 4px 0;">
                <a href="https://rlwrld.ai" style="color:#777; font-size:11px; font-weight:600; text-decoration:none; letter-spacing:0.5px;">RLWRLD</a>
              </p>
              <p style="color:#555555; font-size:11px; line-height:1.6; margin:0 0 4px 0;">
                B1F, 3F RUBINA, 561 Seolleung-ro, Gangnam-gu, Seoul, Korea
              </p>
              <p style="color:#555555; font-size:11px; line-height:1.6; margin:0 0 12px 0;">
                do-not-reply@rlwrld.ai &mdash; This mailbox is not monitored.
              </p>
              <p style="color:#444444; font-size:10px; line-height:1.5; margin:0;">
                &copy; 2026 RLWRLD Inc. You received this because you signed up for the RLDX Launch List.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
}

function buildPlainText(record: WaitlistRecord): string {
  const name = record.full_name || "there";
  const number = record.id;

  return `Hi ${name},

You're #${number} on the RLDX Launch List. Welcome.

RLDX is a Vision-Language-Action foundation model built for real-world
dexterous manipulation — pick, place, assemble, tool-use, and beyond.
We're building it in the open, and you're now part of that journey.

What you signed up for:
  - Early access to RLDX when it launches
  - Priority updates on benchmarks, demos, and release milestones
  - Invitations to launch events (San Francisco · Tokyo · Seoul, Q2 2026)

What happens next:
  1. We're onboarding the launch list in waves.
  2. You'll get a separate email when your access is ready.
  3. Until then, we'll keep you posted on major updates only — no spam.

Thank you for your interest in RLDX.

Follow our progress:
  X (Twitter)  → https://x.com/RLWRLD_ai
  LinkedIn     → https://www.linkedin.com/company/rlwrld/
  YouTube      → https://www.youtube.com/@rlwrld.dexterity

— The RLDX Team

────────────────────────────────
RLWRLD Inc.
B1F, 3F RUBINA, 561 Seolleung-ro, Gangnam-gu, Seoul, Korea
https://rlwrld.ai
do-not-reply@rlwrld.ai — This mailbox is not monitored.
For inquiries, visit https://rlwrld.ai`;
}

Deno.serve(async (req) => {
  // Webhook payload from Supabase Database Webhook
  const payload = await req.json();
  const record: WaitlistRecord = payload.record;

  if (!record || !record.email) {
    return new Response(
      JSON.stringify({ error: "No record or email in payload" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const name = record.full_name || "there";
  const subject = `Welcome to RLDX, ${name} — You're #${record.id}`;

  try {
    // 1. Send email via Resend API
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [record.email],
        reply_to: REPLY_TO,
        subject,
        html: buildHtml(record),
        text: buildPlainText(record),
      }),
    });

    const resendData = await resendRes.json();

    if (!resendRes.ok) {
      // Log failure
      await supabase.from("email_logs").insert({
        waitlist_id: record.id,
        email: record.email,
        status: "failed",
        error_message: JSON.stringify(resendData),
      });

      console.error("Resend API error:", resendData);
      return new Response(
        JSON.stringify({ error: "Email send failed", details: resendData }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    // 2. Log success & update waitlist
    const now = new Date().toISOString();

    await Promise.all([
      supabase.from("email_logs").insert({
        waitlist_id: record.id,
        email: record.email,
        status: "sent",
        resend_id: resendData.id,
        sent_at: now,
      }),
      supabase
        .from("waitlist")
        .update({ confirmation_sent_at: now })
        .eq("id", record.id),
    ]);

    console.log(`Confirmation email sent to ${record.email} (Resend ID: ${resendData.id})`);

    return new Response(
      JSON.stringify({ success: true, resend_id: resendData.id }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (err) {
    // Unexpected error
    await supabase.from("email_logs").insert({
      waitlist_id: record.id,
      email: record.email,
      status: "failed",
      error_message: err instanceof Error ? err.message : String(err),
    });

    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
});
