"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function registerUser(data: {
  fullName: string;
  email: string;
  password: string;
  role?: string;
}) {
  try {
    const trimmedName = data.fullName?.trim();
    const trimmedEmail = data.email?.trim().toLowerCase();
    const password = data.password;
    const role = data.role?.trim() || "Siswa";

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

    // Check existing email
    const existing = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    });

    if (existing) {
      return { success: false, error: "Email sudah terdaftar. Silakan gunakan email lain atau masuk." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        fullName: trimmedName,
        email: trimmedEmail,
        password: hashedPassword,
        role: normalizedRole,
        institution: "SMKN 3 Jakarta",
        department: normalizedRole === "Siswa" ? "Rekayasa Perangkat Lunak" : "Hubin & PKL",
        notificationEmail: true,
        weeklySummary: true,
      },
    });

    // If registered as Siswa, ensure a linked student record exists
    if (normalizedRole === "Siswa") {
      const existingStudent = await prisma.student.findFirst({
        where: { OR: [{ email: trimmedEmail }, { name: trimmedName }] },
      });

      if (!existingStudent) {
        await prisma.student.create({
          data: {
            nisn: `005${Math.floor(1000000 + Math.random() * 9000000)}`,
            name: trimmedName,
            class: "XII RPL 1",
            department: "Rekayasa Perangkat Lunak",
            email: trimmedEmail,
            stage: "Pendaftaran & Pembekalan",
            status: "Pembekalan",
          },
        });
      }
    }

    return {
      success: true,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    };
  } catch (error: any) {
    console.error("Error in registerUser:", error);
    return {
      success: false,
      error: error?.message || "Gagal membuat akun pengguna.",
    };
  }
}
