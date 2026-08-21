import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/auth";
import DataMasterView from "@/components/dashboard/views/DataMasterView";

export const metadata = {
  title: "Data Master Siswa & DUDI - InternTrack",
};

export default async function DataMasterPage() {
  const session = await getServerAuthSession();
  if (!session?.user) {
    redirect("/login");
  }

  const userRole = (session.user as any).role;
  if (userRole !== "Admin" && userRole !== "Guru Pembimbing") {
    redirect("/dashboard");
  }

  return <DataMasterView />;
}
