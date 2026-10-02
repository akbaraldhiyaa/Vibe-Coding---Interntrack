import { getServerAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import StudentDashboardView from "@/components/dashboard/views/StudentDashboardView";

export const metadata = {
  title: "Dashboard Siswa - InternTrack",
};

export default async function StudentDashboardPage() {
  const session = await getServerAuthSession();
  if (!session?.user) {
    redirect("/login");
  }

  const role = (session.user as any).role;
  if (role !== "Siswa") {
    if (role === "Guru Pembimbing" || role === "Pembimbing Sekolah") {
      redirect("/dashboard/teacher");
    }
    redirect("/dashboard/admin");
  }

  return <StudentDashboardView />;
}
