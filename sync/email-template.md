# RLDX Waitlist — Welcome Email Template

## Metadata

| Field | Value |
|-------|-------|
| **From** | `RLDX by RLWRLD <launch@rlwrld.ai>` |
| **Reply-To** | `do-not-reply@rlwrld.ai` |
| **Subject** | `Welcome to RLDX, {{full_name}} — You're #{{waitlist_number}}` |
| **Provider** | Resend |

---

## Template Variables

| Variable | Source | Example |
|----------|--------|---------|
| `{{full_name}}` | `row.full_name` | Hyosup Shin |
| `{{waitlist_number}}` | `row.id` | 42 |

---

## Email Body (Plain Text)

```
Hi {{full_name}},

You're #{{waitlist_number}} on the RLDX Launch List. Welcome.

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
For inquiries, visit https://rlwrld.ai
```

---

## Email Body (HTML)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="dark">
  <meta name="supported-color-schemes" content="dark">
  <title>Welcome to RLDX</title>
</head>
<body style="margin:0; padding:0; background-color:#0a0a0a; font-family:Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; -webkit-font-smoothing:antialiased;">

  <!-- Preheader (hidden preview text) -->
  <div style="display:none; max-height:0; overflow:hidden; font-size:1px; line-height:1px; color:#0a0a0a;">
    You're #{{waitlist_number}} on the RLDX Launch List. Here's what happens next.
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#0a0a0a; padding:0;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="560" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px; width:100%;">

          <!-- Logo -->
          <tr>
            <td style="padding-bottom:32px; text-align:center;">
              <span style="color:#50EACE; font-size:22px; font-weight:800; letter-spacing:1.5px;">RLDX</span>
            </td>
          </tr>

          <!-- Main Card -->
          <tr>
            <td style="background-color:#141414; border:1px solid #2a2a2a; border-radius:8px; padding:44px 40px;">

              <!-- Greeting -->
              <p style="color:#e8e8e8; font-size:22px; font-weight:600; margin:0 0 8px 0; line-height:1.3;">
                Hi {{full_name}},
              </p>

              <!-- Waitlist Number Badge -->
              <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 28px 0;">
                <tr>
                  <td style="background-color:rgba(80,234,206,0.1); border:1px solid rgba(80,234,206,0.25); border-radius:20px; padding:6px 16px;">
                    <span style="color:#50EACE; font-size:14px; font-weight:600;">
                      Launch List #{{waitlist_number}}
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Intro -->
              <p style="color:#b8b8b8; font-size:15px; line-height:1.75; margin:0 0 24px 0;">
                Welcome to the RLDX Launch List. RLDX is a <strong style="color:#e8e8e8;">Vision-Language-Action foundation model</strong> built for real-world dexterous manipulation — pick, place, assemble, tool-use, and beyond. We're building it in the open, and you're now part of that journey.
              </p>

              <!-- Divider -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 24px 0;">
                <tr><td style="border-top:1px solid #2a2a2a;"></td></tr>
              </table>

              <!-- What You Signed Up For -->
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

              <!-- What Happens Next -->
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

              <!-- Divider -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 24px 0;">
                <tr><td style="border-top:1px solid #2a2a2a;"></td></tr>
              </table>

              <!-- Thank you -->
              <p style="color:#b8b8b8; font-size:15px; line-height:1.75; margin:0 0 28px 0;">
                Thank you for your interest in RLDX.
              </p>

              <!-- CTA Button -->
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

          <!-- Footer (Social + Company Info) -->
          <tr>
            <td style="padding:32px 0 0 0; text-align:center;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 20px 0;">
                <tr><td style="border-top:1px solid #1a1a1a;"></td></tr>
              </table>
              <p style="margin:0 0 16px 0;">
                <a href="https://x.com/RLWRLD_ai" style="color:#8a8a8a; font-size:12px; text-decoration:none;">X (Twitter)</a>
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
</html>
```

---

## Design Notes

| Element | Value | Matches Site? |
|---------|-------|:---:|
| Background | `#0a0a0a` | Yes |
| Card BG | `#141414` | Yes |
| Card Border | `#2a2a2a` | Yes |
| Accent Color | `#50EACE` | Yes |
| Primary Text | `#e8e8e8` | Yes |
| Secondary Text | `#b8b8b8` | Yes |
| Muted Text | `#8a8a8a` | Yes |
| Font | Inter (system fallback) | Yes |
| Border Radius | `8px` | Yes |
| Button Style | Filled cyan, dark text | Yes |

---

## Integration Notes

- **Trigger**: Called from `sync-notion.js` after each new Supabase row is synced
- **Provider**: [Resend](https://resend.com) — free tier: 100 emails/day, 3,000/month
- **Rate**: Low volume — one email per new signup
- **Unsubscribe**: Not required for transactional/confirmation emails (CAN-SPAM)
- **Preheader**: Hidden preview text included for email clients
- **Dark mode**: `color-scheme: dark` meta tag for native dark mode support
- **Accessibility**: `role="presentation"` on layout tables, semantic structure
