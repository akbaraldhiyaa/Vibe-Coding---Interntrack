"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getAuthContext, requireRoles, getTeacherSupervisorWhere } from "@/lib/rbac";

export async function getDudis() {
  try {
    const authRes = await getAuthContext();
    if (!authRes.success) {
      return { success: false, error: authRes.error };
    }

    const { role, department, studentId, fullName, email } = authRes.auth;

    if (role === "Admin" || (role as string) === "Admin Sekolah" || role === "Kepala Sekolah") {
      const dudis = await prisma.dudi.findMany();
      return { success: true, data: dudis };
    }

    let studentWhere: any = {};
    if (role === "Siswa") {
      studentWhere = studentId ? { id: studentId } : { OR: [{ email }, { name: fullName }] };
    } else if (role === "Guru Pembimbing" || (role as string) === "Pembimbing Sekolah") {
      studentWhere = getTeacherSupervisorWhere(fullName);
    }

    const students = await prisma.student.findMany({
      where: studentWhere,
      select: { dudiId: true },
    });
    const dudiIds = students.map((s) => s.dudiId).filter((id): id is string => Boolean(id));

    const dudis = dudiIds.length > 0
      ? await prisma.dudi.findMany({ where: { id: { in: dudiIds } } })
      : [];
    return { success: true, data: dudis };
  } catch (error) {
    console.error("Error fetching DUDIs:", error);
    return { success: false, error: "Gagal mengambil data DUDI" };
  }
}

export async function addDudi(data: {
  name: string;
  address: string;
  industrySupervisor: string;
  quota: number;
}) {
  try {
    const authRes = await requireRoles(["Admin"]);
    if (!authRes.success) {
      return { success: false, error: authRes.error };
    }

    const dudi = await prisma.dudi.create({
      data,
    });
    revalidatePath("/dashboard");
    return { success: true, data: dudi };
  } catch (error) {
    console.error("Error adding DUDI:", error);
    return { success: false, error: "Gagal menambahkan DUDI" };
  }
}

export async function deleteDudi(id: string) {
  try {
    const authRes = await requireRoles(["Admin"]);
    if (!authRes.success) {
      return { success: false, error: authRes.error };
    }

    await prisma.dudi.delete({
      where: { id },
    });
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error deleting DUDI:", error);
    return { success: false, error: "Gagal menghapus DUDI" };
  }
}

export async function updateDudi(id: string, data: any) {
  try {
    const authRes = await requireRoles(["Admin"]);
    if (!authRes.success) {
      return { success: false, error: authRes.error };
    }

    const dudi = await prisma.dudi.update({
      where: { id },
      data,
    });
    revalidatePath("/dashboard");
    return { success: true, data: dudi };
  } catch (error) {
    console.error("Error updating DUDI:", error);
    return { success: false, error: "Gagal memperbarui DUDI" };
  }
}

