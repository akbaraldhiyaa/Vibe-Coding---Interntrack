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
  username?: string | null;
  hasPassword?: boolean;
  linkedProviders?: string[];
  avatar?: string | null;
}

export async function getUserProfile(email?: string) {
  try {
    const authRes = await getAuthContext();
    let user: Awaited<ReturnType<typeof prisma.user.findUnique>> = null;

    if (authRes.success) {
      user = await prisma.user.findUnique({
        where: { id: authRes.auth.userId },
        include: { linkedAccounts: true },
      });
    } else if (email && email.trim()) {
      user = await prisma.user.findUnique({
        where: { email: email.trim().toLowerCase() },
        include: { linkedAccounts: true },
      });
    }

    if (!user) {
      user = await prisma.user.findFirst({ include: { linkedAccounts: true } });
    }

    if (!user) {
      return { success: false, error: "Pengguna tidak ditemukan." };
    }

    const linkedProviders = ((user as any).linkedAccounts ?? []).map(
      (la: { provider: string }) => la.provider
    );

    const data: UserProfileData = {
      fullName: user.fullName,
      email: user.email,
      whatsapp: user.whatsapp || "",
      institution: user.institution || "SMKN 3 Jakarta",
      department: user.department || "",
      notificationEmail: user.notificationEmail ?? true,
      weeklySummary: user.weeklySummary ?? false,
      role: user.role,
      username: (user as any).username ?? null,
      hasPassword: !!(user as any).password,
      linkedProviders,
      avatar: (user as any).avatar ?? null,
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
    const trimmedDept = payload.department?.trim() || "";
    // Server-side enforcement: Single-school lock to SMKN 3 Jakarta
    const lockedInstitution = "SMKN 3 Jakarta";

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
        institution: lockedInstitution,
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
      institution: user.institution || lockedInstitution,
      department: user.department || "",
      notificationEmail: user.notificationEmail,
      weeklySummary: user.weeklySummary,
      role: user.role,
      avatar: (user as any).avatar ?? null,
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

import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function uploadProfilePicture(formData: FormData) {
  try {
    const authRes = await getAuthContext();
    if (!authRes.success) {
      return { success: false, error: authRes.error };
    }

    const userId = authRes.auth.userId;
    const file = formData.get("file") as File;

    if (!file) {
      return { success: false, error: "Tidak ada file yang diunggah." };
    }

    // Validate size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      return { success: false, error: "Ukuran file tidak boleh lebih dari 2MB." };
    }

    // Validate type
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      return { success: false, error: "Format file harus JPG, PNG, atau WEBP." };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.type.split("/")[1];
    const filename = `avatar-${userId}-${Date.now()}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public/uploads/avatars");
    const filepath = path.join(uploadDir, filename);

    // Ensure directory exists
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (err) {
      // Ignore if exists
    }

    await writeFile(filepath, buffer);
    const avatarUrl = `/uploads/avatars/${filename}`;

    await prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarUrl as any },
    });

    revalidatePath("/dashboard");

    return { success: true, avatarUrl };
  } catch (error: any) {
    console.error("Error uploading profile picture:", error);
    return { success: false, error: "Gagal mengunggah foto profil. Silakan coba lagi." };
  }
}

