"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getAuthContext, requireRoles, getTeacherSupervisorWhere, isTeacherAuthorizedForStudent } from "@/lib/rbac";

export async function getStudents() {
  try {
    const authRes = await getAuthContext();
    if (!authRes.success) {
      return { success: false, error: authRes.error };
    }

    const { role, department, studentId, fullName, email } = authRes.auth;

    let studentWhere: any = {};
    if (role === "Siswa") {
      studentWhere = studentId ? { id: studentId } : { OR: [{ email }, { name: fullName }] };
    } else if (role === "Guru Pembimbing" || (role as string) === "Pembimbing Sekolah") {
      studentWhere = getTeacherSupervisorWhere(fullName);
    } else if (role === "Pembimbing Industri") {
      studentWhere = { industrySupervisor: { contains: fullName, mode: "insensitive" } };
    }

    const students = await prisma.student.findMany({
      where: studentWhere,
      include: {
        dudi: true,
      },
    });
    return { success: true, data: students };
  } catch (error) {
    console.error("Error fetching students:", error);
    return { success: false, error: "Gagal mengambil data siswa" };
  }
}

export async function addStudent(data: {
  nisn: string;
  name: string;
  class: string;
  department: string;
  dudiId?: string;
}) {
  try {
    const authRes = await requireRoles(["Admin", "Guru Pembimbing"]);
    if (!authRes.success) {
      return { success: false, error: authRes.error };
    }

    const student = await prisma.student.create({
      data,
    });
    revalidatePath("/dashboard");
    return { success: true, data: student };
  } catch (error) {
    console.error("Error adding student:", error);
    return { success: false, error: "Gagal menambahkan siswa" };
  }
}

export async function deleteStudent(id: string) {
  try {
    const authRes = await requireRoles(["Admin"]);
    if (!authRes.success) {
      return { success: false, error: authRes.error };
    }

    await prisma.student.delete({
      where: { id },
    });
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error deleting student:", error);
    return { success: false, error: "Gagal menghapus siswa" };
  }
}

export async function updateStudent(id: string, data: any) {
  try {
    const authRes = await requireRoles(["Admin", "Guru Pembimbing"]);
    if (!authRes.success) {
      return { success: false, error: authRes.error };
    }

    if (authRes.auth.role === "Guru Pembimbing" || (authRes.auth.role as string) === "Pembimbing Sekolah") {
      const isAuth = await isTeacherAuthorizedForStudent(authRes.auth.fullName, id);
      if (!isAuth) {
        return { success: false, error: "Forbidden: Anda hanya dapat memperbarui data siswa bimbingan Anda." };
      }
    }

    const student = await prisma.student.update({
      where: { id },
      data,
    });
    revalidatePath("/dashboard");
    return { success: true, data: student };
  } catch (error) {
    console.error("Error updating student:", error);
    return { success: false, error: "Gagal memperbarui siswa" };
  }
}

export async function updateStudentStage(id: string, stage: string) {
  try {
    const authRes = await requireRoles(["Admin", "Guru Pembimbing"]);
    if (!authRes.success) {
      return { success: false, error: authRes.error };
    }

    if (authRes.auth.role === "Guru Pembimbing" || (authRes.auth.role as string) === "Pembimbing Sekolah") {
      const isAuth = await isTeacherAuthorizedForStudent(authRes.auth.fullName, id);
      if (!isAuth) {
        return { success: false, error: "Forbidden: Anda hanya dapat memperbarui tahapan siswa bimbingan Anda." };
      }
    }

    const student = await prisma.student.update({
      where: { id },
      data: { stage },
    });
    revalidatePath("/dashboard");
    return { success: true, data: student };
  } catch (error) {
    console.error("Error updating student stage:", error);
    return { success: false, error: "Gagal memperbarui tahapan siswa" };
  }
}

