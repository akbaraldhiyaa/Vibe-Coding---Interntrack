import { getServerAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Dashboard - InternTrack",
};

export default async function DashboardPage() {
  const session = await getServerAuthSession();
  if (!session?.user) {
    redirect("/login");
  }

  const role = (session.user as any).role;
  if (role === "Guru Pembimbing" || role === "Pembimbing Sekolah") {
    redirect("/dashboard/teacher");
  } else if (role === "Admin" || role === "Admin Sekolah" || role === "Kepala Sekolah") {
    redirect("/dashboard/admin");
  } else {
    redirect("/dashboard/student");
  }
}
