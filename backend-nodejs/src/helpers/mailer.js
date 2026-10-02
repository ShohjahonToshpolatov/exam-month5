import nodemailer from "nodemailer";
import { otpEmail } from "./emailTemplates.js";

const createTransporter = () => {
  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASSWORD
  ) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE).toLowerCase() === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

const sendOtpEmail = async (to, fullName, code, purpose) => {
  const transporter = createTransporter();

  if (!transporter) {
    console.log(`[DEV OTP] ${to}: ${code}`);
    return;
  }

  const email = otpEmail(fullName, code, purpose);

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: email.subject,
    html: email.html,
  });
};

export { sendOtpEmail };
