import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/auth";
import AuthPage from "@/components/AuthPage";

export const metadata = {
  title: "Masuk / Daftar - InternTrack",
  description: "Masuk ke sistem monitoring PKL InternTrack",
};

export default async function LoginPage() {
  const session = await getServerAuthSession();

  if (session?.user) {
    redirect("/dashboard");
  }

  return <AuthPage />;
}
