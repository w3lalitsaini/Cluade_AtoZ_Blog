import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  return transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });
}

// ─── Shared email wrapper ────────────────────────────────────────────────────
function emailWrapper(content: string) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    </head>
    <body style="margin:0;padding:0;background:#f5f5f0;font-family:'Segoe UI',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f0;padding:40px 0;">
        <tr>
          <td align="center">
            <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">
              <!-- Header -->
              <tr>
                <td style="background:#f97316;padding:28px 40px;text-align:center;">
                  <span style="font-size:28px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">
                    A<span style="color:#fff4eb;">to</span>Z
                    <span style="font-weight:300;font-size:22px;color:#fff;">Blogs</span>
                  </span>
                </td>
              </tr>
              <!-- Body -->
              <tr>
                <td style="padding:40px;">
                  ${content}
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #f0f0f0;">
                  <p style="margin:0;font-size:12px;color:#9ca3af;">
                    © ${new Date().getFullYear()} AtoZ Blogs. You received this email because you have an account with us.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

// ─── Templates ────────────────────────────────────────────────────────────────

export function verificationEmailTemplate(token: string, name: string) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${token}`;
  return emailWrapper(`
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#111827;">
      Welcome, ${name}! 👋
    </h1>
    <p style="margin:0 0 24px;font-size:15px;color:#6b7280;line-height:1.6;">
      Thanks for signing up. Please verify your email address to complete your
      AtoZ Blogs account setup.
    </p>
    <div style="text-align:center;margin:32px 0;">
      <a href="${url}"
         style="display:inline-block;background:#f97316;color:#ffffff;font-weight:700;
                font-size:15px;padding:14px 32px;border-radius:10px;text-decoration:none;
                letter-spacing:0.2px;">
        ✅ Verify My Email
      </a>
    </div>
    <p style="margin:24px 0 0;font-size:13px;color:#9ca3af;line-height:1.5;">
      This link expires in <strong style="color:#374151;">24 hours</strong>.
      If you didn't create an account, you can safely ignore this email.
    </p>
    <p style="margin:8px 0 0;font-size:12px;color:#d1d5db;word-break:break-all;">
      Or copy this URL: ${url}
    </p>
  `);
}

export function passwordResetEmailTemplate(token: string) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`;
  return emailWrapper(`
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#111827;">
      Reset Your Password 🔐
    </h1>
    <p style="margin:0 0 24px;font-size:15px;color:#6b7280;line-height:1.6;">
      We received a request to reset your AtoZ Blogs password.
      Click the button below to choose a new one.
    </p>
    <div style="text-align:center;margin:32px 0;">
      <a href="${url}"
         style="display:inline-block;background:#f97316;color:#ffffff;font-weight:700;
                font-size:15px;padding:14px 32px;border-radius:10px;text-decoration:none;
                letter-spacing:0.2px;">
        🔑 Reset Password
      </a>
    </div>
    <p style="margin:24px 0 0;font-size:13px;color:#9ca3af;line-height:1.5;">
      This link expires in <strong style="color:#374151;">1 hour</strong>.
      If you didn't request a password reset, you can safely ignore this email —
      your password will not change.
    </p>
    <p style="margin:8px 0 0;font-size:12px;color:#d1d5db;word-break:break-all;">
      Or copy this URL: ${url}
    </p>
  `);
}

export function newsletterWelcomeTemplate(name?: string) {
  return emailWrapper(`
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#111827;">
      You&apos;re subscribed! 🎉
    </h1>
    <p style="margin:0 0 16px;font-size:15px;color:#6b7280;line-height:1.6;">
      Hi${name ? ` ${name}` : ""}! You&apos;re now subscribed to the AtoZ Blogs newsletter.
      Expect the latest articles, curated reads, and updates delivered straight to your inbox.
    </p>
    <p style="margin:0;font-size:13px;color:#9ca3af;">You can unsubscribe at any time.</p>
  `);
}
