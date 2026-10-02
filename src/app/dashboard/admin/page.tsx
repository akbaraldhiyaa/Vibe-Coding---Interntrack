import { getServerAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminDashboardView from "@/components/dashboard/views/AdminDashboardView";

export const metadata = {
  title: "Dashboard Admin Sekolah - InternTrack",
};

export default async function AdminDashboardPage() {
  const session = await getServerAuthSession();
  if (!session?.user) {
    redirect("/login");
  }

  const role = (session.user as any).role;
  if (role !== "Admin" && role !== "Admin Sekolah" && role !== "Kepala Sekolah") {
    if (role === "Siswa") {
      redirect("/dashboard/student");
    }
    if (role === "Guru Pembimbing" || role === "Pembimbing Sekolah") {
      redirect("/dashboard/teacher");
    }
  }

  return <AdminDashboardView />;
}
