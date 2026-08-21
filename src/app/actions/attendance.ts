"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getAuthContext, requireRoles } from "@/lib/rbac";

export async function getAttendance() {
  try {
    const authRes = await getAuthContext();
    if (!authRes.success) {
      return { success: false, error: authRes.error };
    }

    const records = await prisma.attendanceRecord.findMany({
      include: {
        student: {
          include: {
            dudi: true,
          },
        },
      },
    });
    return { success: true, data: records };
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return { success: false, error: "Gagal mengambil data absensi" };
  }
}

export async function addAttendance(data: {
  studentId: string;
  date: string;
  timeIn?: string;
  timeOut?: string;
  status: string;
  correctionNote?: string;
}) {
  try {
    const authRes = await getAuthContext();
    if (!authRes.success) {
      return { success: false, error: authRes.error };
    }

    const { role, studentId } = authRes.auth;

    // Ownership check: If role is Siswa, student can only record for themselves
    if (role === "Siswa") {
      if (studentId && data.studentId !== studentId) {
        return {
          success: false,
          error: "Forbidden: Anda hanya dapat mencatat absensi untuk akun Anda sendiri.",
        };
      }
    } else if (!["Admin", "Guru Pembimbing", "Pembimbing Industri"].includes(role)) {
      return {
        success: false,
        error: "Forbidden: Peran Anda tidak memiliki izin mencatat absensi.",
      };
    }

    const record = await prisma.attendanceRecord.create({
      data,
    });
    revalidatePath("/dashboard");
    return { success: true, data: record };
  } catch (error) {
    console.error("Error adding attendance:", error);
    return { success: false, error: "Gagal menambahkan absensi" };
  }
}

export async function updateAttendance(
  id: string,
  data: {
    date?: string;
    timeIn?: string;
    timeOut?: string;
    status?: string;
    correctionNote?: string;
  }
) {
  try {
    const authRes = await getAuthContext();
    if (!authRes.success) {
      return { success: false, error: authRes.error };
    }

    const { role, studentId } = authRes.auth;

    if (role === "Siswa") {
      // Siswa can only update correctionNote on their own record
      const existing = await prisma.attendanceRecord.findUnique({ where: { id } });
      if (!existing || existing.studentId !== studentId) {
        return {
          success: false,
          error: "Forbidden: Anda hanya dapat mengajukan koreksi untuk absensi Anda sendiri.",
        };
      }
    } else if (!["Admin", "Guru Pembimbing", "Pembimbing Industri"].includes(role)) {
      return {
        success: false,
        error: "Forbidden: Peran Anda tidak memiliki izin memperbarui absensi.",
      };
    }

    const record = await prisma.attendanceRecord.update({
      where: { id },
      data,
    });
    revalidatePath("/dashboard");
    return { success: true, data: record };
  } catch (error) {
    console.error("Error updating attendance:", error);
    return { success: false, error: "Gagal mengupdate absensi" };
  }
}

export async function deleteAttendance(id: string) {
  try {
    const authRes = await requireRoles(["Admin"]);
    if (!authRes.success) {
      return { success: false, error: authRes.error };
    }

    await prisma.attendanceRecord.delete({
      where: { id },
    });
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error deleting attendance:", error);
    return { success: false, error: "Gagal menghapus absensi" };
  }
}

