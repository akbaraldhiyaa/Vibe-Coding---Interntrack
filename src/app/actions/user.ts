"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getAuthContext } from "@/lib/rbac";

export interface UserProfileData {
  fullName: string;
  email: string;
  whatsapp: string;
  institution: string;
  department: string;
  notificationEmail: boolean;
  weeklySummary: boolean;
  role?: string;
}

export async function getUserProfile(email?: string) {
  try {
    const authRes = await getAuthContext();
    let user = null;

    if (authRes.success) {
      user = await prisma.user.findUnique({
        where: { id: authRes.auth.userId },
      });
    } else if (email && email.trim()) {
      user = await prisma.user.findUnique({
        where: { email: email.trim().toLowerCase() },
      });
    }

    if (!user) {
      user = await prisma.user.findFirst();
    }

    if (!user) {
      return { success: false, error: "Pengguna tidak ditemukan." };
    }

    const data: UserProfileData = {
      fullName: user.fullName,
      email: user.email,
      whatsapp: user.whatsapp || "",
      institution: user.institution || "",
      department: user.department || "",
      notificationEmail: user.notificationEmail ?? true,
      weeklySummary: user.weeklySummary ?? false,
      role: user.role,
    };

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return { success: false, error: "Gagal memuat profil pengguna dari database" };
  }
}

export async function updateUserProfileDB(
  currentEmail: string,
  payload: UserProfileData
) {
  try {
    const authRes = await getAuthContext();
    if (!authRes.success) {
      return { success: false, error: authRes.error };
    }

    const targetUserId = authRes.auth.userId;

    const trimmedName = payload.fullName?.trim();
    const trimmedEmail = payload.email?.trim().toLowerCase();
    const trimmedWa = payload.whatsapp?.trim() || "";
    const trimmedInst = payload.institution?.trim() || "";
    const trimmedDept = payload.department?.trim() || "";

    // 1. Validation
    if (!trimmedName) {
      return { success: false, error: "Nama lengkap wajib diisi." };
    }

    if (!trimmedEmail) {
      return { success: false, error: "Email akun wajib diisi." };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return { success: false, error: "Format email tidak valid." };
    }

    if (trimmedWa) {
      const waRegex = /^(?:\+62|62|0)8[1-9][0-9]{7,11}$/;
      if (!waRegex.test(trimmedWa)) {
        return {
          success: false,
          error:
            "Format nomor WhatsApp tidak valid. Gunakan format seperti 08123456789 atau +628123456789.",
        };
      }
    }

    // 2. Check if changing email and new email is taken by another account
    const existingTarget = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    });

    if (existingTarget && existingTarget.id !== targetUserId) {
      return {
        success: false,
        error: "Email sudah digunakan oleh akun lain. Gunakan email yang berbeda.",
      };
    }

    // 3. Update in database using authenticated target user ID
    const user = await prisma.user.update({
      where: { id: targetUserId },
      data: {
        fullName: trimmedName,
        email: trimmedEmail,
        whatsapp: trimmedWa,
        institution: trimmedInst,
        department: trimmedDept,
        notificationEmail: !!payload.notificationEmail,
        weeklySummary: !!payload.weeklySummary,
      },
    });

    revalidatePath("/dashboard");

    const returnData: UserProfileData = {
      fullName: user.fullName,
      email: user.email,
      whatsapp: user.whatsapp || "",
      institution: user.institution || "",
      department: user.department || "",
      notificationEmail: user.notificationEmail,
      weeklySummary: user.weeklySummary,
      role: user.role,
    };

    return { success: true, data: returnData };
  } catch (error: any) {
    console.error("Error updating user profile in database:", error);
    return {
      success: false,
      error: error?.message || "Gagal menyimpan perubahan ke database. Silakan coba lagi.",
    };
  }
}

