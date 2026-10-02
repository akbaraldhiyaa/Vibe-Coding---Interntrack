import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type Role =
  | "Admin"
  | "Admin Sekolah"
  | "Guru Pembimbing"
  | "Pembimbing Sekolah"
  | "Pembimbing Industri"
  | "Siswa"
  | "Kepala Sekolah";

export interface AuthContext {
  userId: string;
  email: string;
  fullName: string;
  role: Role;
  department?: string | null;
  studentId?: string;
}

export type AuthResult =
  | { success: true; auth: AuthContext }
  | { success: false; error: string; status: 401 | 403 };

export async function getAuthContext(): Promise<AuthResult> {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.email) {
      return {
        success: false,
        error: "Unauthorized: Silakan login terlebih dahulu.",
        status: 401,
      };
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email.trim().toLowerCase() },
    });

    if (!user) {
      return {
        success: false,
        error: "Unauthorized: Pengguna tidak ditemukan dalam database.",
        status: 401,
      };
    }

    let normalizedRole: Role = (user.role as Role) || "Siswa";
    if ((user.role as string) === "Pembimbing Sekolah") normalizedRole = "Guru Pembimbing";
    if ((user.role as string) === "Admin Sekolah") normalizedRole = "Admin";

    let studentId: string | undefined;
    if (normalizedRole === "Siswa") {
      let student = await prisma.student.findFirst({
        where: {
          OR: [
            { email: user.email },
            { name: user.fullName },
          ],
        },
      });

      if (!student) {
        student = await prisma.student.create({
          data: {
            nisn: `005${Math.floor(1000000 + Math.random() * 9000000)}`,
            name: user.fullName,
            class: "XII",
            department: user.department || "Umum",
            email: user.email,
            stage: "Pendaftaran & Pembekalan",
            status: "Pembekalan",
            whatsapp: user.whatsapp || null,
          },
        });
      }
      studentId = student?.id;
    }

    return {
      success: true,
      auth: {
        userId: user.id,
        email: user.email,
        fullName: user.fullName,
        role: normalizedRole,
        department: user.department || null,
        studentId,
      },
    };
  } catch (error) {
    console.error("Error in getAuthContext:", error);
    return {
      success: false,
      error: "Terjadi kesalahan autentikasi server.",
      status: 401,
    };
  }
}

import { Prisma } from "@prisma/client";

export async function requireRoles(allowedRoles: Role[]): Promise<AuthResult> {
  const authRes = await getAuthContext();
  if (!authRes.success) {
    return authRes;
  }

  if (!allowedRoles.includes(authRes.auth.role)) {
    return {
      success: false,
      error: `Forbidden: Peran ${authRes.auth.role} tidak memiliki izin untuk melakukan tindakan ini.`,
      status: 403,
    };
  }

  return authRes;
}

/**
 * Builds Prisma where clause for students supervised by a teacher.
 * Guru Pembimbing only accesses students whose schoolSupervisor explicitly matches their name.
 * Department is NEVER used as an authorization grant for supervision access.
 */
export function getTeacherSupervisorWhere(fullName?: string): Prisma.StudentWhereInput {
  const trimmed = fullName?.trim();
  if (!trimmed) {
    return { id: "__UNAUTHORIZED_EMPTY__" };
  }

  const conditions: Prisma.StudentWhereInput[] = [
    { schoolSupervisor: { contains: trimmed, mode: "insensitive" } },
  ];

  // Strip common Indonesian academic degrees/titles if present (e.g. ", S.Pd", " S.Pd", ", M.Kom")
  const nameWithoutDegrees = trimmed
    .replace(/,\s*(S\.[A-Za-z]+|M\.[A-Za-z]+|Drs\.|Dr\.|H\.|Hj\.)/gi, "")
    .replace(/\s+(S\.[A-Za-z]+|M\.[A-Za-z]+)/gi, "")
    .trim();

  if (nameWithoutDegrees && nameWithoutDegrees !== trimmed && nameWithoutDegrees.length >= 3) {
    conditions.push({ schoolSupervisor: { contains: nameWithoutDegrees, mode: "insensitive" } });
  }

  return conditions.length === 1 ? conditions[0] : { OR: conditions };
}

/**
 * Verifies whether a teacher is authorized to supervise/modify a specific student.
 */
export async function isTeacherAuthorizedForStudent(teacherFullName: string, studentId: string): Promise<boolean> {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { schoolSupervisor: true },
  });
  if (!student?.schoolSupervisor) return false;

  const trimmed = teacherFullName.trim().toLowerCase();
  const supervisor = student.schoolSupervisor.toLowerCase();

  if (supervisor.includes(trimmed)) return true;

  const nameWithoutDegrees = trimmed
    .replace(/,\s*(s\.[a-z]+|m\.[a-z]+|drs\.|dr\.|h\.|hj\.)/gi, "")
    .replace(/\s+(s\.[a-z]+|m\.[a-z]+)/gi, "")
    .trim();

  if (nameWithoutDegrees && nameWithoutDegrees.length >= 3 && supervisor.includes(nameWithoutDegrees)) {
    return true;
  }

  return false;
}

