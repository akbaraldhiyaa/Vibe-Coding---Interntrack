"use server";

import { prisma } from "@/lib/prisma";
import { getAuthContext, Role, getTeacherSupervisorWhere } from "@/lib/rbac";
import { Prisma } from "@prisma/client";

export async function fetchDashboardData(userEmail?: string) {
  try {
    const authRes = await getAuthContext();

    if (!authRes.success) {
      return { success: false, error: authRes.error };
    }

    const { role, department, studentId, fullName, email } = authRes.auth;

    // Build role- and department-scoped query filter for Student
    let studentWhere: Prisma.StudentWhereInput = {};

    if (role === "Siswa") {
      studentWhere = studentId
        ? { id: studentId }
        : {
            OR: [
              { email: email },
              { name: fullName },
            ],
          };
    } else if (role === "Guru Pembimbing" || (role as string) === "Pembimbing Sekolah") {
      studentWhere = getTeacherSupervisorWhere(fullName);
    } else if (role === "Pembimbing Industri") {
      studentWhere = {
        OR: [
          { industrySupervisor: { contains: fullName, mode: "insensitive" } },
        ],
      };
    } else {
      // Admin / Admin Sekolah / Kepala Sekolah: school-wide access
      studentWhere = {};
    }

    const dbStudents = await prisma.student.findMany({
      where: studentWhere,
      include: { dudi: true },
    });

    const allowedStudentIds = dbStudents.map((s) => s.id);

    // Dudi scoping:
    let dbDudis: any[] = [];
    if (role === "Admin" || (role as string) === "Admin Sekolah" || role === "Kepala Sekolah") {
      dbDudis = await prisma.dudi.findMany();
    } else {
      const dudiIds = dbStudents
        .map((s) => s.dudiId)
        .filter((id): id is string => Boolean(id));
      dbDudis = dudiIds.length > 0
        ? await prisma.dudi.findMany({ where: { id: { in: dudiIds } } })
        : [];
    }

    const dbAttendance = await prisma.attendanceRecord.findMany({
      where: { studentId: { in: allowedStudentIds } },
      include: { student: { include: { dudi: true } } },
      orderBy: { createdAt: "desc" },
    });

    const dbJournals = await prisma.journal.findMany({
      where: { studentId: { in: allowedStudentIds } },
      include: { student: { include: { dudi: true } } },
      orderBy: { createdAt: "desc" },
    });

    const dbEvaluations = await prisma.evaluation.findMany({
      where: { studentId: { in: allowedStudentIds } },
      include: { student: { include: { dudi: true } } },
      orderBy: { createdAt: "desc" },
    });

    // Fetch user from DB based on authenticated session
    const dbUser = await prisma.user.findUnique({
      where: { id: authRes.auth.userId },
    });

    const mappedUserProfile = dbUser
      ? {
          fullName: dbUser.fullName,
          email: dbUser.email,
          whatsapp: dbUser.whatsapp || "",
          institution: dbUser.institution || "SMKN 3 Jakarta",
          department: dbUser.department || "",
          notificationEmail: dbUser.notificationEmail ?? true,
          weeklySummary: dbUser.weeklySummary ?? false,
          avatar: dbUser.avatar || null,
        }
      : {
          fullName: fullName,
          email: email,
          whatsapp: "",
          institution: "SMKN 3 Jakarta",
          department: department || "",
          notificationEmail: true,
          weeklySummary: false,
          avatar: null,
        };

    const userRole = (role === "Admin Sekolah" ? "Admin" : role) as Role;

    // Map Prisma models to Zustand expected types
    const mappedStudents = dbStudents.map((s) => {
      const studentAttendance = dbAttendance.filter((a) => a.studentId === s.id);
      const totalAttendance = studentAttendance.length;
      const presentCount = studentAttendance.filter((a) => a.status === "Hadir").length;
      const attendanceRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 100;
      const journalCount = dbJournals.filter((j) => j.studentId === s.id).length;

      return {
        id: s.id,
        nisn: s.nisn,
        name: s.name,
        class: s.class,
        department: s.department,
        dudiName: s.dudi?.name || "-",
        schoolSupervisor: s.schoolSupervisor || "-",
        industrySupervisor: s.industrySupervisor || "-",
        stage: s.stage as any,
        status: s.status as any,
        avatar: s.avatar || "",
        whatsapp: s.whatsapp || "-",
        email: s.email || "-",
        attendanceRate,
        journalCount,
      };
    });

    const mappedDudis = dbDudis.map((d) => ({
      id: d.id,
      name: d.name,
      address: d.address,
      industrySupervisor: d.industrySupervisor,
      quota: d.quota,
      activeStudents: dbStudents.filter((s) => s.dudiId === d.id).length,
      qrCode: d.qrCode || "",
    }));

    const mappedAttendance = dbAttendance.map((a) => ({
      id: a.id,
      studentId: a.studentId,
      studentName: a.student.name,
      dudiName: a.student.dudi?.name || "-",
      date: a.date,
      timeIn: a.timeIn || "",
      timeOut: a.timeOut || "",
      status: a.status as any,
      correctionNote: a.correctionNote || "",
    }));

    const mappedJournals = dbJournals.map((j) => ({
      id: j.id,
      studentId: j.studentId,
      studentName: j.student.name,
      dudiName: j.student.dudi?.name || "-",
      date: j.date,
      workHours: 8,
      title: j.activity,
      description: j.description,
      status: j.status as any,
      feedback: j.feedback || "",
      photoUrl: j.image || "",
    }));

    const mappedEvaluations = dbEvaluations.map((e) => {
      let grade: "A" | "B" | "C" | "D" = "A";
      if (e.finalScore >= 90) grade = "A";
      else if (e.finalScore >= 80) grade = "B";
      else if (e.finalScore >= 70) grade = "C";
      else grade = "D";

      return {
        id: e.id,
        studentId: e.studentId,
        studentName: e.student.name,
        dudiName: e.student.dudi?.name || "-",
        technicalScore: e.technicalScore,
        softSkillScore: e.nonTechnicalScore,
        disciplineScore: 100,
        ethicsScore: 100,
        finalScore: e.finalScore,
        grade: grade,
        status: "Terverifikasi" as const,
        certificateNumber: e.certificateNumber || "",
        issuedAt: e.certificateNumber ? e.updatedAt.toISOString().split("T")[0] : undefined,
      };
    });

    return {
      success: true,
      data: {
        students: mappedStudents,
        dudiList: mappedDudis,
        attendanceRecords: mappedAttendance,
        journals: mappedJournals,
        evaluations: mappedEvaluations,
        userProfile: mappedUserProfile,
        currentRole: userRole,
      },
    };
  } catch (error) {
    console.error("Failed to fetch dashboard data:", error);
    return { success: false, error: "Failed to fetch data from database" };
  }
}
