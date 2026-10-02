"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getAuthContext, requireRoles, getTeacherSupervisorWhere, isTeacherAuthorizedForStudent } from "@/lib/rbac";

export async function getEvaluations() {
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
      select: { id: true },
    });
    const allowedStudentIds = students.map((s) => s.id);

    const evaluations = await prisma.evaluation.findMany({
      where: { studentId: { in: allowedStudentIds } },
      include: {
        student: {
          include: {
            dudi: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: evaluations };
  } catch (error) {
    console.error("Error fetching evaluations:", error);
    return { success: false, error: "Gagal mengambil data penilaian" };
  }
}

export async function addEvaluation(data: {
  studentId: string;
  technicalScore: number;
  nonTechnicalScore: number;
  finalScore: number;
  notes?: string;
}) {
  try {
    const authRes = await requireRoles(["Admin", "Guru Pembimbing", "Pembimbing Industri"]);
    if (!authRes.success) {
      return { success: false, error: authRes.error };
    }

    if (authRes.auth.role === "Guru Pembimbing" || (authRes.auth.role as string) === "Pembimbing Sekolah") {
      const isAuth = await isTeacherAuthorizedForStudent(authRes.auth.fullName, data.studentId);
      if (!isAuth) {
        return { success: false, error: "Forbidden: Anda hanya dapat menilai siswa bimbingan Anda." };
      }
    }

    const evalRecord = await prisma.evaluation.create({
      data,
    });
    revalidatePath("/dashboard");
    return { success: true, data: evalRecord };
  } catch (error) {
    console.error("Error adding evaluation:", error);
    return { success: false, error: "Gagal menambahkan penilaian" };
  }
}

export async function updateEvaluation(
  id: string,
  data: {
    technicalScore?: number;
    nonTechnicalScore?: number;
    finalScore?: number;
    certificateNumber?: string;
    notes?: string;
  }
) {
  try {
    const authRes = await requireRoles(["Admin", "Guru Pembimbing", "Pembimbing Industri"]);
    if (!authRes.success) {
      return { success: false, error: authRes.error };
    }

    if (authRes.auth.role === "Guru Pembimbing" || (authRes.auth.role as string) === "Pembimbing Sekolah") {
      const existing = await prisma.evaluation.findUnique({
        where: { id },
        select: { studentId: true },
      });
      if (!existing || !(await isTeacherAuthorizedForStudent(authRes.auth.fullName, existing.studentId))) {
        return { success: false, error: "Forbidden: Anda hanya dapat mengupdate penilaian siswa bimbingan Anda." };
      }
    }

    const evalRecord = await prisma.evaluation.update({
      where: { id },
      data,
    });
    revalidatePath("/dashboard");
    return { success: true, data: evalRecord };
  } catch (error) {
    console.error("Error updating evaluation:", error);
    return { success: false, error: "Gagal mengupdate penilaian" };
  }
}

export async function issueCertificateDB(studentId: string, certificateNumber: string) {
  try {
    const authRes = await requireRoles(["Admin", "Guru Pembimbing", "Pembimbing Industri"]);
    if (!authRes.success) {
      return { success: false, error: authRes.error };
    }

    if (authRes.auth.role === "Guru Pembimbing" || (authRes.auth.role as string) === "Pembimbing Sekolah") {
      const isAuth = await isTeacherAuthorizedForStudent(authRes.auth.fullName, studentId);
      if (!isAuth) {
        return { success: false, error: "Forbidden: Anda hanya dapat menerbitkan sertifikat untuk siswa bimbingan Anda." };
      }
    }

    const existing = await prisma.evaluation.findFirst({
      where: { studentId },
    });

    if (existing) {
      const updated = await prisma.evaluation.update({
        where: { id: existing.id },
        data: { certificateNumber },
      });
      revalidatePath("/dashboard");
      return { success: true, data: updated };
    } else {
      const created = await prisma.evaluation.create({
        data: {
          studentId,
          technicalScore: 85,
          nonTechnicalScore: 85,
          finalScore: 85,
          certificateNumber,
          notes: "Penerbitan sertifikat selesai PKL",
        },
      });
      revalidatePath("/dashboard");
      return { success: true, data: created };
    }
  } catch (error) {
    console.error("Error issuing certificate:", error);
    return { success: false, error: "Gagal menyimpan penerbitan sertifikat ke database" };
  }
}

export async function deleteEvaluation(id: string) {
  try {
    const authRes = await requireRoles(["Admin"]);
    if (!authRes.success) {
      return { success: false, error: authRes.error };
    }

    await prisma.evaluation.delete({
      where: { id },
    });
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error deleting evaluation:", error);
    return { success: false, error: "Gagal menghapus penilaian" };
  }
}

