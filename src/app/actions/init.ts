"use server";

import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/rbac";

export async function fetchDashboardData(userEmail?: string) {
  try {
    const authRes = await getAuthContext();

    const dbStudents = await prisma.student.findMany({
      include: { dudi: true },
    });
    const dbDudis = await prisma.dudi.findMany();
    const dbAttendance = await prisma.attendanceRecord.findMany({
      include: { student: { include: { dudi: true } } },
    });
    const dbJournals = await prisma.journal.findMany({
      include: { student: { include: { dudi: true } } },
    });
    const dbEvaluations = await prisma.evaluation.findMany({
      include: { student: { include: { dudi: true } } },
    });

    // Fetch user from DB based on authenticated session or provided email
    let dbUser = null;
    if (authRes.success) {
      dbUser = await prisma.user.findUnique({
        where: { id: authRes.auth.userId },
      });
    } else if (userEmail && userEmail.trim()) {
      dbUser = await prisma.user.findUnique({
        where: { email: userEmail.trim().toLowerCase() },
      });
    }

    if (!dbUser) {
      dbUser = await prisma.user.findFirst();
    }

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
          fullName: "Pengguna",
          email: "",
          whatsapp: "",
          institution: "SMKN 3 Jakarta",
          department: "",
          notificationEmail: true,
          weeklySummary: false,
          avatar: null,
        };

    const userRole = (dbUser?.role || "Siswa") as any;

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
