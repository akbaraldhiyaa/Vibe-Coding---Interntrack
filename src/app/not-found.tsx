import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "404 - Halaman Tidak Ditemukan | InternTrack",
};

export default function NotFound() {
  return (
    <div className="min-h-screen w-full bg-[var(--background)] text-[var(--foreground)] flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xl text-center space-y-5">
        <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>
        
        <div>
          <h1 className="text-xl font-bold text-[var(--foreground)]">Halaman Tidak Ditemukan</h1>
          <p className="text-xs text-[var(--card-subtitle)] mt-1.5 leading-relaxed">
            Halaman yang Anda tuju tidak tersedia atau telah dipindahkan.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
