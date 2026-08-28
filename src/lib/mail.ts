import nodemailer from "nodemailer";
import { renderVerificationEmail, renderPasswordResetEmail } from "./email-templates";

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 465,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
}

export async function sendVerificationOTP(
  email: string,
  name: string,
  otp: string
) {
  try {
    if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.error("Missing SMTP configuration. Cannot send verification email.");
      return { success: false, error: "Layanan email verifikasi belum dikonfigurasi. Silakan hubungi administrator atau coba lagi nanti." };
    }

    const transporter = getTransporter();

    const mailOptions = {
      from: process.env.SMTP_FROM || "InternTrack <noreply@interntrack.id>",
      to: email,
      subject: "Kode Verifikasi InternTrack",
      text: `Halo ${name},\n\nKode verifikasi kamu adalah: ${otp}\n\nKode ini berlaku selama 10 menit. Jangan bagikan kode ini kepada siapapun.\n\nSalam,\nTim InternTrack`,
      html: renderVerificationEmail(name, otp),
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error: any) {
    console.error("Error sending OTP email:", {
      operation: "sendVerificationOTP",
      code: error.code,
      command: error.command,
      responseCode: error.responseCode,
      message: error.message,
    });
    return { success: false, error: "Gagal mengirim email verifikasi." };
  }
}

export async function sendPasswordResetEmail(
  email: string,
  name: string,
  token: string
) {
  try {
    if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.error("Missing SMTP configuration. Cannot send password reset email.");
      return { success: false, error: "Layanan email belum dikonfigurasi." };
    }

    const transporter = getTransporter();
    
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const resetLink = `${baseUrl}/reset-password?token=${token}`;

    const mailOptions = {
      from: process.env.SMTP_FROM || "InternTrack <noreply@interntrack.id>",
      to: email,
      subject: "Reset Password InternTrack",
      text: `Halo ${name},\n\nKami menerima permintaan untuk mereset kata sandi akun InternTrack kamu. Klik tautan berikut untuk membuat kata sandi baru:\n\n${resetLink}\n\nTautan ini berlaku selama 30 menit.\n\nSalam,\nTim InternTrack`,
      html: renderPasswordResetEmail(name, resetLink),
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error: any) {
    console.error("Error sending password reset email:", {
      operation: "sendPasswordResetEmail",
      code: error.code,
      command: error.command,
      responseCode: error.responseCode,
      message: error.message,
    });
    return { success: false, error: "Gagal mengirim email reset password." };
  }
}
