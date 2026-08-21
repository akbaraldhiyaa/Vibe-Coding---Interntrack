import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type Role =
  | "Admin"
  | "Guru Pembimbing"
  | "Pembimbing Industri"
  | "Siswa"
  | "Kepala Sekolah";

export interface AuthContext {
  userId: string;
  email: string;
  fullName: string;
  role: Role;
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

    let studentId: string | undefined;
    if (user.role === "Siswa") {
      const student = await prisma.student.findFirst({
        where: {
          OR: [
            { email: user.email },
            { name: user.fullName },
          ],
        },
      });
      studentId = student?.id;
    }

    return {
      success: true,
      auth: {
        userId: user.id,
        email: user.email,
        fullName: user.fullName,
        role: (user.role as Role) || "Siswa",
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
