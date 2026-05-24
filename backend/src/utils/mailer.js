import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send a password reset email.
 */
export async function sendResetEmail(toEmail, resetUrl) {
  const html = `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#fff;border-radius:12px;border:1px solid #E5E7EB">
      <div style="text-align:center;margin-bottom:24px">
        <div style="display:inline-block;background:#1E293B;border-radius:10px;padding:10px 14px">
          <span style="color:#3B82F6;font-weight:800;font-size:18px;letter-spacing:-0.02em">CodeCall</span>
        </div>
      </div>
      <h2 style="font-size:20px;font-weight:700;color:#111827;margin:0 0 8px;text-align:center">
        Reset Your Password
      </h2>
      <p style="font-size:14px;color:#6B7280;line-height:1.6;text-align:center;margin:0 0 24px">
        We received a request to reset your password. Click the button below to choose a new one.
      </p>
      <div style="text-align:center;margin-bottom:24px">
        <a href="${resetUrl}" style="display:inline-block;background:#2563EB;color:#fff;text-decoration:none;padding:12px 32px;border-radius:8px;font-size:14px;font-weight:600">
          Reset Password
        </a>
      </div>
      <p style="font-size:12px;color:#9CA3AF;text-align:center;line-height:1.5;margin:0">
        This link expires in <strong>30 minutes</strong>.<br>
        If you didn't request this, you can safely ignore this email.
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"CodeCall" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: "Reset your CodeCall password",
    html,
  });
}
