import { getServerAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import TeacherDashboardView from "@/components/dashboard/views/TeacherDashboardView";

export const metadata = {
  title: "Dashboard Guru Pembimbing - InternTrack",
};

export default async function TeacherDashboardPage() {
  const session = await getServerAuthSession();
  if (!session?.user) {
    redirect("/login");
  }

  const role = (session.user as any).role;
  if (role !== "Guru Pembimbing" && role !== "Pembimbing Sekolah") {
    if (role === "Siswa") {
      redirect("/dashboard/student");
    }
    redirect("/dashboard/admin");
  }

  return <TeacherDashboardView />;
}
