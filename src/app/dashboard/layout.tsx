import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/auth";
import DashboardLayoutClient from "@/components/dashboard/DashboardLayoutClient";

export const metadata = {
  title: "Dashboard - InternTrack",
  description: "Sistem Pemantauan PKL & Magang Siswa",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerAuthSession();

  if (!session?.user) {
    redirect("/login");
  }

  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
