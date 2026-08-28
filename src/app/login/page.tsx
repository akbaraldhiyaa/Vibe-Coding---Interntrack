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
    // Only redirect to dashboard if onboarding is complete
    if ((session.user as any).setupComplete) {
      redirect("/dashboard");
    }
  }

  return <AuthPage />;
}
