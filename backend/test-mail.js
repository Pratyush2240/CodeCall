import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";

console.log("SMTP_USER:", process.env.SMTP_USER);
console.log("SMTP_PASS:", process.env.SMTP_PASS ? `${process.env.SMTP_PASS.length} chars` : "MISSING");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

try {
  const info = await transporter.sendMail({
    from: `"CodeCall Test" <${process.env.SMTP_USER}>`,
    to: process.env.SMTP_USER,
    subject: "CodeCall Test Email",
    text: "If you see this, nodemailer is working!",
  });
  console.log("✅ Email sent:", info.messageId);
} catch (err) {
  console.error("❌ Email failed:", err.message);
  console.error("   Full error:", err);
}
