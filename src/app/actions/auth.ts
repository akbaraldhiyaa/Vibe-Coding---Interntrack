"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendVerificationOTP, sendPasswordResetEmail } from "@/lib/mail";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";

function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString();
}

export async function registerUser(data: {
  username: string;
  fullName: string;
  email: string;
  password: string;
  role?: string;
}) {
  try {
    const trimmedUsername = data.username?.trim().toLowerCase();
    const trimmedName = data.fullName?.trim();
    const trimmedEmail = data.email?.trim().toLowerCase();
    const password = data.password;
    const role = data.role?.trim() || "Siswa";

    if (!trimmedUsername || !/^[a-z0-9_]{3,20}$/.test(trimmedUsername)) {
      return { success: false, error: "Username harus 3-20 karakter, hanya huruf kecil, angka, dan underscore." };
    }

    if (!trimmedName || trimmedName.length < 3) {
      return { success: false, error: "Nama lengkap minimal 3 karakter." };
    }

    if (!trimmedEmail) {
      return { success: false, error: "Email wajib diisi." };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return { success: false, error: "Format email tidak valid." };
    }

    if (!password || password.length < 6) {
      return { success: false, error: "Kata sandi minimal 6 karakter." };
    }

    const allowedRoles = ["Admin", "Guru Pembimbing", "Pembimbing Industri", "Siswa", "Kepala Sekolah", "Pembimbing Sekolah"];
    const normalizedRole = role === "Pembimbing Sekolah" ? "Guru Pembimbing" : role;
    if (!allowedRoles.includes(normalizedRole) && !allowedRoles.includes(role)) {
      return { success: false, error: "Peran pengguna tidak valid." };
    }

    // Check existing email OR username in real User table
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: trimmedEmail }, { username: trimmedUsername }],
      },
    });

    if (existingUser) {
      if (existingUser.email === trimmedEmail) return { success: false, error: "Email sudah terdaftar." };
      if (existingUser.username === trimmedUsername) return { success: false, error: "Username sudah terdaftar." };
    }

    // Generate secure OTP
    const otp = generateOTP();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create or update PendingRegistration
    await prisma.pendingRegistration.upsert({
      where: { email: trimmedEmail },
      update: {
        username: trimmedUsername,
        fullName: trimmedName,
        password: hashedPassword,
        role: normalizedRole,
        otpHash,
        attempts: 0,
        expiresAt,
      },
      create: {
        email: trimmedEmail,
        username: trimmedUsername,
        fullName: trimmedName,
        password: hashedPassword,
        role: normalizedRole,
        otpHash,
        attempts: 0,
        expiresAt,
      },
    });

    // Send the email
    const mailRes = await sendVerificationOTP(trimmedEmail, trimmedName, otp);
    if (!mailRes.success) {
      return { success: false, error: mailRes.error || "Gagal mengirim email OTP. Silakan coba lagi." };
    }

    return {
      success: true,
      pending: true,
      email: trimmedEmail,
    };
  } catch (error: any) {
    console.error("Registration error:", error);
    return { success: false, error: error?.message || "Terjadi kesalahan saat pendaftaran." };
  }
}

export async function verifyRegistrationOTP(email: string, otp: string) {
  try {
    const trimmedEmail = email.trim().toLowerCase();
    
    const pending = await prisma.pendingRegistration.findUnique({
      where: { email: trimmedEmail },
    });

    if (!pending) {
      return { success: false, error: "Sesi pendaftaran tidak ditemukan. Silakan daftar ulang." };
    }

    if (pending.attempts >= 5) {
      return { success: false, error: "Terlalu banyak percobaan yang salah. Silakan kirim ulang kode." };
    }

    if (new Date() > pending.expiresAt) {
      return { success: false, error: "Kode OTP sudah kedaluwarsa. Silakan kirim ulang kode." };
    }

    const isValid = await bcrypt.compare(otp, pending.otpHash);

    if (!isValid) {
      await prisma.pendingRegistration.update({
        where: { email: trimmedEmail },
        data: { attempts: pending.attempts + 1 },
      });
      return { success: false, error: "Kode OTP salah." };
    }

    // OTP Valid! Create the real User
    const user = await prisma.user.create({
      data: {
        username: pending.username,
        fullName: pending.fullName,
        email: pending.email,
        password: pending.password,
        role: pending.role,
        notificationEmail: true,
        weeklySummary: true,
      },
    });

    // Create Student if role is Siswa
    if (pending.role === "Siswa") {
      const existingStudent = await prisma.student.findFirst({
        where: { OR: [{ email: pending.email }, { name: pending.fullName }] },
      });

      if (!existingStudent) {
        await prisma.student.create({
          data: {
            nisn: `005${Math.floor(1000000 + Math.random() * 9000000)}`,
            name: pending.fullName,
            class: "XII RPL 1",
            department: "Rekayasa Perangkat Lunak",
            email: pending.email,
            stage: "Pendaftaran & Pembekalan",
            status: "Pembekalan",
          },
        });
      }
    }

    // Clean up PendingRegistration
    await prisma.pendingRegistration.delete({
      where: { email: trimmedEmail },
    });

    return { success: true };
  } catch (error: any) {
    console.error("OTP verification error:", error);
    return { success: false, error: "Terjadi kesalahan saat memverifikasi OTP." };
  }
}

export async function resendRegistrationOTP(email: string) {
  try {
    const trimmedEmail = email.trim().toLowerCase();
    
    const pending = await prisma.pendingRegistration.findUnique({
      where: { email: trimmedEmail },
    });

    if (!pending) {
      return { success: false, error: "Sesi pendaftaran tidak ditemukan." };
    }

    // Cooldown check (allow resend if previous was created > 60 seconds ago)
    const timeSinceLastUpdate = Date.now() - (pending as any).updatedAt.getTime();
    if (timeSinceLastUpdate < 60000) {
      return { success: false, error: "Tunggu 1 menit sebelum mengirim ulang kode." };
    }

    const otp = generateOTP();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.pendingRegistration.update({
      where: { email: trimmedEmail },
      data: {
        otpHash,
        attempts: 0,
        expiresAt,
      },
    });

    const mailRes = await sendVerificationOTP(trimmedEmail, pending.fullName, otp);
    if (!mailRes.success) {
      return { success: false, error: mailRes.error || "Gagal mengirim email OTP. Silakan coba lagi." };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Resend OTP error:", error);
    return { success: false, error: "Terjadi kesalahan saat mengirim ulang OTP." };
  }
}

export async function linkGoogleAccount(idToken: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      return { success: false, error: "Sesi tidak valid. Silakan masuk kembali." };
    }
    const userId = (session.user as any).id;

    const { adminAuth } = await import("@/lib/firebase-admin");
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const existingLink = await prisma.linkedAccount.findFirst({
      where: {
        OR: [
          { provider: "google", providerAccountId: uid },
          { userId, provider: "google" }
        ]
      }
    });

    if (existingLink) {
      if (existingLink.userId === userId) return { success: false, error: "Akun Google ini sudah tertaut dengan akun Anda." };
      return { success: false, error: "Akun Google ini sudah tertaut dengan pengguna lain." };
    }

    await prisma.linkedAccount.create({
      data: {
        userId,
        provider: "google",
        providerAccountId: uid,
      }
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error linking Google account:", error);
    return { success: false, error: "Gagal menautkan akun Google." };
  }
}

export async function registerGoogleUser(data: {
  fullName: string;
  role?: string;
  idToken: string;
  institution: string;
  department?: string;
  whatsapp?: string;
  idNumber: string;
}) {
  try {
    const { adminAuth } = await import("@/lib/firebase-admin");
    const decodedToken = await adminAuth.verifyIdToken(data.idToken);
    const uid = decodedToken.uid;
    const email = decodedToken.email?.toLowerCase();

    if (!email) {
      return { success: false, error: "Token Google tidak valid." };
    }

    const trimmedName = data.fullName?.trim();
    const role = data.role?.trim() || "Siswa";

    if (!trimmedName || trimmedName.length < 3) {
      return { success: false, error: "Nama lengkap minimal 3 karakter." };
    }

    const allowedRoles = ["Admin", "Guru Pembimbing", "Pembimbing Industri", "Siswa", "Kepala Sekolah", "Pembimbing Sekolah"];
    const normalizedRole = role === "Pembimbing Sekolah" ? "Guru Pembimbing" : role;
    if (!allowedRoles.includes(normalizedRole) && !allowedRoles.includes(role)) {
      return { success: false, error: "Peran pengguna tidak valid." };
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { success: false, error: "Email sudah terdaftar. Silakan masuk dengan email dan kata sandi, lalu tautkan akun Google di Pengaturan." };
    }

    const existingLink = await prisma.linkedAccount.findUnique({
      where: { provider_providerAccountId: { provider: "google", providerAccountId: uid } }
    });

    if (existingLink) {
      return { success: false, error: "Akun Google ini sudah terdaftar." };
    }

    const user = await prisma.user.create({
      data: {
        fullName: trimmedName,
        email,
        role: normalizedRole,
        institution: "SMKN 3 Jakarta",
        department: data.department || null,
        whatsapp: data.whatsapp || null,
        notificationEmail: true,
        weeklySummary: true,
        linkedAccounts: {
          create: {
            provider: "google",
            providerAccountId: uid,
          }
        }
      },
    });

    if (normalizedRole === "Siswa") {
      const existingStudent = await prisma.student.findFirst({
        where: { OR: [{ email }, { name: trimmedName }] },
      });
      if (!existingStudent) {
        await prisma.student.create({
          data: {
            nisn: data.idNumber,
            name: trimmedName,
            class: "XII RPL 1",
            department: data.department || "Umum",
            email,
            stage: "Pendaftaran & Pembekalan",
            status: "Pembekalan",
            whatsapp: data.whatsapp || null,
          },
        });
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error in registerGoogleUser:", error);
    return { success: false, error: "Gagal membuat akun." };
  }
}

/**
 * Adds username + password credentials to the currently authenticated user.
 * Used by Google-first users who want to also log in with username/password.
 * The current session determines the target user — client cannot supply a userId.
 */
export async function addPasswordCredentials(data: {
  username: string;
  password: string;
}) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      return { success: false, error: "Sesi tidak valid. Silakan masuk kembali." };
    }
    const userId = (session.user as any).id;

    const trimmedUsername = data.username?.trim().toLowerCase();

    if (!trimmedUsername || !/^[a-z0-9_]{3,20}$/.test(trimmedUsername)) {
      return { success: false, error: "Username harus 3-20 karakter (huruf kecil, angka, _)." };
    }

    if (!data.password || data.password.length < 6) {
      return { success: false, error: "Kata sandi minimal 6 karakter." };
    }

    // Load current user
    const currentUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!currentUser) {
      return { success: false, error: "Pengguna tidak ditemukan." };
    }

    if ((currentUser as any).username) {
      return { success: false, error: "Akun ini sudah memiliki username." };
    }

    if ((currentUser as any).password) {
      return { success: false, error: "Akun ini sudah memiliki kata sandi." };
    }

    // Check username uniqueness across all users
    const existingUsername = await prisma.user.findFirst({
      where: { username: trimmedUsername },
    });
    if (existingUsername) {
      return { success: false, error: "Username sudah digunakan. Pilih username lain." };
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    await prisma.user.update({
      where: { id: userId },
      data: {
        username: trimmedUsername,
        password: hashedPassword,
      },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error in addPasswordCredentials:", error);
    return { success: false, error: "Gagal menambahkan kredensial. Silakan coba lagi." };
  }
}

export async function unlinkGoogleAccount() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      return { success: false, error: "Sesi tidak valid." };
    }
    const userId = (session.user as any).id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { linkedAccounts: true },
    });

    if (!user) return { success: false, error: "Pengguna tidak ditemukan." };

    const hasGoogle = user.linkedAccounts.some(acc => acc.provider === "google");
    if (!hasGoogle) return { success: false, error: "Akun Google tidak tertaut." };

    const hasPassword = !!user.password;
    if (!hasPassword) {
      return { success: false, error: "Tidak dapat memutuskan akun ini karena ini adalah satu-satunya metode login yang tersedia." };
    }

    await prisma.linkedAccount.deleteMany({
      where: { userId, provider: "google" },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error unlinking Google account:", error);
    return { success: false, error: "Gagal memutuskan akun Google." };
  }
}

export async function unlinkPasswordCredentials() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      return { success: false, error: "Sesi tidak valid." };
    }
    const userId = (session.user as any).id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { linkedAccounts: true },
    });

    if (!user) return { success: false, error: "Pengguna tidak ditemukan." };

    const hasPassword = !!user.password;
    if (!hasPassword) return { success: false, error: "Kredensial password tidak tertaut." };

    const hasGoogle = user.linkedAccounts.some(acc => acc.provider === "google");
    if (!hasGoogle) {
      return { success: false, error: "Tidak dapat memutuskan akun ini karena ini adalah satu-satunya metode login yang tersedia." };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { username: null, password: null },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error unlinking password credentials:", error);
    return { success: false, error: "Gagal memutuskan kredensial password." };
  }
}

export async function changePassword(currentPassword: string, newPassword: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      return { success: false, error: "Sesi tidak valid." };
    }
    const userId = (session.user as any).id;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return { success: false, error: "Pengguna tidak ditemukan." };
    if (!user.password) return { success: false, error: "Pengguna ini tidak memiliki password untuk diubah." };

    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: "Kata sandi baru minimal 6 karakter." };
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return { success: false, error: "Password saat ini salah." };
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error changing password:", error);
    return { success: false, error: "Gagal mengganti password." };
  }
}

export async function deleteMyAccount() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      return { success: false, error: "Sesi tidak valid." };
    }
    const userId = (session.user as any).id;

    // Load current user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return { success: false, error: "Pengguna tidak ditemukan." };
    }

    // Attempt to delete avatar file safely
    if (user.avatar) {
      try {
        // avatar path is likely e.g., '/uploads/avatars/filename.jpg' or similar
        // Adjust based on the actual path structure used in the app, or just wrap in try-catch to be safe.
        // If it starts with '/', we prepend process.cwd() + '/public'
        if (user.avatar.startsWith('/')) {
          const avatarPath = path.join(process.cwd(), 'public', user.avatar);
          await fs.unlink(avatarPath);
        }
      } catch (e) {
        // Ignore file deletion errors to prevent blocking account deletion
        console.warn("Could not delete avatar file during account deletion:", e);
      }
    }

    // Execute deletion using a Prisma transaction.
    // Note: We use sequential await operations if prisma.$transaction has issues with distinct models.
    await prisma.$transaction(async (tx) => {
      // 1. Delete associated Student record if it exists. (This cascades to AttendanceRecord, Journal, Evaluation)
      // Since Student email is unique and tied to User email
      const student = await tx.student.findFirst({
        where: { email: user.email }
      });
      if (student) {
        await tx.student.delete({
          where: { id: student.id }
        });
      }

      // 2. Delete PendingRegistration if it exists for this email
      const pendingReg = await tx.pendingRegistration.findUnique({
        where: { email: user.email }
      });
      if (pendingReg) {
        await tx.pendingRegistration.delete({
          where: { email: user.email }
        });
      }

      // 3. Finally, delete the User (this cascades to LinkedAccount)
      await tx.user.delete({
        where: { id: userId }
      });
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting account:", error);
    return { success: false, error: "Gagal menghapus akun. Silakan coba lagi." };
  }
}

export async function completeOnboarding(data: {
  role: string;
  institution: string;
  department?: string;
  whatsapp?: string;
  idNumber: string;
}) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      return { success: false, error: "Sesi tidak valid." };
    }
    const userId = (session.user as any).id;
    const userEmail = session.user.email;
    const userName = session.user.name;

    if (!userEmail) return { success: false, error: "Email tidak ditemukan di sesi." };

    const allowedRoles = ["Admin", "Guru Pembimbing", "Pembimbing Industri", "Siswa", "Kepala Sekolah", "Pembimbing Sekolah"];
    const normalizedRole = data.role === "Pembimbing Sekolah" ? "Guru Pembimbing" : data.role;
    if (!allowedRoles.includes(normalizedRole)) {
       return { success: false, error: "Peran pengguna tidak valid." };
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        role: normalizedRole,
        institution: "SMKN 3 Jakarta",
        department: data.department || null,
        whatsapp: data.whatsapp || null,
      },
    });

    if (normalizedRole === "Siswa") {
      const existingStudent = await prisma.student.findFirst({
        where: { email: userEmail },
      });

      if (existingStudent) {
        await prisma.student.update({
          where: { id: existingStudent.id },
          data: {
            nisn: data.idNumber,
            department: data.department || "Umum",
            whatsapp: data.whatsapp || null,
          },
        });
      } else {
        await prisma.student.create({
          data: {
            nisn: data.idNumber,
            name: userName || "Unknown",
            class: "XII",
            department: data.department || "Umum",
            email: userEmail,
            stage: "Pendaftaran & Pembekalan",
            status: "Pembekalan",
            whatsapp: data.whatsapp || null,
          },
        });
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error("completeOnboarding error:", error);
    if (error.code === 'P2002') {
      return { success: false, error: "Nomor Induk sudah terdaftar oleh siswa lain." };
    }
    return { success: false, error: "Gagal menyimpan data onboarding." };
  }
}

export async function requestPasswordReset(email: string) {
  try {
    const trimmedEmail = email.trim().toLowerCase();
    
    // Always return success for anti-enumeration
    const user = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    });

    if (!user) {
      // Simulate delay for anti-enumeration
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true };
    }

    // Rate limiting: check if a token was created in the last 1 minute
    const recentToken = await prisma.passwordResetToken.findFirst({
      where: {
        email: trimmedEmail,
        createdAt: {
          gt: new Date(Date.now() - 60 * 1000), // 1 minute ago
        },
      },
    });

    if (recentToken) {
      // Still return success to prevent enumeration, or return a cooldown error if preferred.
      // Returning error is better UX for cooldowns, though technically leaks that an email *might* exist. 
      // But since we just want anti-enumeration on presence, we can return success, OR we just say "Tunggu 1 menit".
      // Let's return error so they know they are rate limited.
      return { success: false, error: "Tunggu 1 menit sebelum meminta tautan baru." };
    }

    // Delete existing tokens for this email
    await prisma.passwordResetToken.deleteMany({
      where: { email: trimmedEmail },
    });

    // Generate secure token
    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    await prisma.passwordResetToken.create({
      data: {
        email: trimmedEmail,
        tokenHash,
        expiresAt,
      },
    });

    const mailRes = await sendPasswordResetEmail(trimmedEmail, user.fullName, token);
    
    if (!mailRes.success) {
      // Fallback if email sending fails, delete the token
      await prisma.passwordResetToken.deleteMany({ where: { email: trimmedEmail } });
      return { success: false, error: mailRes.error || "Gagal mengirim email reset password." };
    }

    return { success: true };
  } catch (error: any) {
    console.error("requestPasswordReset error:", error);
    return { success: false, error: "Terjadi kesalahan pada server." };
  }
}

export async function resetPassword(token: string, newPassword: string) {
  try {
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: "Kata sandi minimal 6 karakter." };
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });

    if (!resetToken) {
      return { success: false, error: "Tautan reset kata sandi tidak valid atau sudah kedaluwarsa." };
    }

    if (new Date() > resetToken.expiresAt) {
      await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });
      return { success: false, error: "Tautan reset kata sandi sudah kedaluwarsa." };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    await prisma.user.update({
      where: { email: resetToken.email },
      data: { password: hashedPassword },
    });

    // Delete token
    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id },
    });

    return { success: true };
  } catch (error: any) {
    console.error("resetPassword error:", error);
    return { success: false, error: "Terjadi kesalahan saat mereset kata sandi." };
  }
}
