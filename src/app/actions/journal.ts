"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getAuthContext, requireRoles } from "@/lib/rbac";

export async function getJournals() {
  try {
    const authRes = await getAuthContext();
    if (!authRes.success) {
      return { success: false, error: authRes.error };
    }

    const journals = await prisma.journal.findMany({
      include: {
        student: {
          include: {
            dudi: true,
          },
        },
      },
    });
    return { success: true, data: journals };
  } catch (error) {
    console.error("Error fetching journals:", error);
    return { success: false, error: "Gagal mengambil data jurnal" };
  }
}

export async function addJournal(data: {
  studentId: string;
  date: string;
  activity: string;
  description: string;
  image?: string;
}) {
  try {
    const authRes = await getAuthContext();
    if (!authRes.success) {
      return { success: false, error: authRes.error };
    }

    const { role, studentId } = authRes.auth;

    // Ownership check: Siswa can only add journals for themselves
    if (role === "Siswa") {
      if (studentId && data.studentId !== studentId) {
        return {
          success: false,
          error: "Forbidden: Anda hanya dapat mengisi jurnal untuk akun Anda sendiri.",
        };
      }
    } else if (role !== "Admin") {
      return {
        success: false,
        error: "Forbidden: Peran Anda tidak memiliki izin membuat jurnal.",
      };
    }

    const journal = await prisma.journal.create({
      data,
    });
    revalidatePath("/dashboard");
    return { success: true, data: journal };
  } catch (error) {
    console.error("Error adding journal:", error);
    return { success: false, error: "Gagal menambahkan jurnal" };
  }
}

export async function updateJournalStatus(
  id: string,
  status: string,
  feedback?: string
) {
  try {
    const authRes = await requireRoles(["Admin", "Guru Pembimbing", "Pembimbing Industri"]);
    if (!authRes.success) {
      return { success: false, error: authRes.error };
    }

    const journal = await prisma.journal.update({
      where: { id },
      data: { status, feedback },
    });
    revalidatePath("/dashboard");
    return { success: true, data: journal };
  } catch (error) {
    console.error("Error updating journal status:", error);
    return { success: false, error: "Gagal mengupdate status jurnal" };
  }
}

export async function updateJournal(
  id: string,
  data: {
    date?: string;
    activity?: string;
    description?: string;
    status?: string;
    image?: string;
    feedback?: string;
  }
) {
  try {
    const authRes = await getAuthContext();
    if (!authRes.success) {
      return { success: false, error: authRes.error };
    }

    const { role, studentId } = authRes.auth;

    // If Siswa, check ownership
    if (role === "Siswa") {
      const existing = await prisma.journal.findUnique({ where: { id } });
      if (!existing || existing.studentId !== studentId) {
        return {
          success: false,
          error: "Forbidden: Anda hanya dapat memperbarui jurnal milik Anda sendiri.",
        };
      }
    } else if (!["Admin", "Guru Pembimbing", "Pembimbing Industri"].includes(role)) {
      return {
        success: false,
        error: "Forbidden: Peran Anda tidak memiliki izin memperbarui jurnal.",
      };
    }

    const journal = await prisma.journal.update({
      where: { id },
      data,
    });
    revalidatePath("/dashboard");
    return { success: true, data: journal };
  } catch (error) {
    console.error("Error updating journal:", error);
    return { success: false, error: "Gagal mengupdate jurnal" };
  }
}

export async function deleteJournal(id: string) {
  try {
    const authRes = await getAuthContext();
    if (!authRes.success) {
      return { success: false, error: authRes.error };
    }

    const { role, studentId } = authRes.auth;

    if (role === "Siswa") {
      const existing = await prisma.journal.findUnique({ where: { id } });
      if (!existing || existing.studentId !== studentId) {
        return {
          success: false,
          error: "Forbidden: Anda hanya dapat menghapus jurnal milik Anda sendiri.",
        };
      }
    } else if (role !== "Admin") {
      return {
        success: false,
        error: "Forbidden: Peran Anda tidak memiliki izin menghapus jurnal.",
      };
    }

    await prisma.journal.delete({
      where: { id },
    });
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error deleting journal:", error);
    return { success: false, error: "Gagal menghapus jurnal" };
  }
}

