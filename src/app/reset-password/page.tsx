"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import { resetPassword } from "@/app/actions/auth";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="text-center">
        <div className="mb-5 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-left">
            <p className="font-semibold">Tautan Tidak Valid</p>
            <p className="mt-1 opacity-90">Tautan reset kata sandi tidak valid atau tidak ditemukan.</p>
          </div>
        </div>
        <Link href="/" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-2 mt-4">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Kata sandi baru minimal 6 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await resetPassword(token, password);
      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/");
        }, 3000);
      } else {
        setError(res.error || "Gagal mereset kata sandi.");
      }
    } catch (err: any) {
      setError("Terjadi kesalahan sistem. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center">
        <div className="mb-6 p-5 rounded-2xl bg-[var(--badge-success-bg)] border border-[var(--badge-success-border)] text-[var(--badge-success-text)] flex flex-col items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-12 h-12 mb-2" />
          <div>
            <p className="font-bold text-lg mb-1">Kata Sandi Diperbarui!</p>
            <p className="text-sm opacity-90">
              Kata sandi kamu berhasil diubah. Kamu akan diarahkan ke halaman login dalam beberapa detik.
            </p>
          </div>
        </div>
        <Link href="/" className="text-sm font-semibold token-btn-primary py-3 px-6 rounded-xl shadow-sm inline-flex items-center justify-center mt-2 w-full">
          Masuk Sekarang
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs font-medium flex items-center gap-2.5 animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Password Field */}
      <div>
        <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">
          Kata sandi baru
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--input-placeholder)]">
            <Lock className="w-4 h-4" />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimal 6 karakter"
            className="w-full token-input pl-10 pr-10 py-2.5 text-sm"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[var(--input-placeholder)] hover:text-[var(--foreground)] transition cursor-pointer"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Confirm Password Field */}
      <div>
        <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">
          Konfirmasi kata sandi
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--input-placeholder)]">
            <Lock className="w-4 h-4" />
          </div>
          <input
            type={showConfirmPassword ? "text" : "password"}
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Ketik ulang kata sandi baru"
            className="w-full token-input pl-10 pr-10 py-2.5 text-sm"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[var(--input-placeholder)] hover:text-[var(--foreground)] transition cursor-pointer"
          >
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading || !password || !confirmPassword}
          className="w-full token-btn-primary py-3 px-4 shadow-sm text-sm font-semibold tracking-wide cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Menyimpan...</span>
            </>
          ) : (
            <span>Simpan Kata Sandi</span>
          )}
        </button>
      </div>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col relative overflow-hidden transition-colors duration-300">
      {/* Abstract Background Accents */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 dark:bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 dark:bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Theme Toggle Button */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50">
        <ThemeToggle />
      </div>

      <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-8 z-10">
        <div className="w-full max-w-[440px] bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl sm:rounded-3xl p-6 sm:p-9 shadow-[var(--card-shadow)] transition-all">
          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-[var(--card-title)]">
              Buat Kata Sandi Baru
            </h2>
            <p className="text-sm text-[var(--card-subtitle)] mt-1.5 leading-relaxed font-normal">
              Silakan masukkan kata sandi baru untuk akun kamu.
            </p>
          </div>

          <Suspense fallback={<div className="flex justify-center p-6"><Loader2 className="w-6 h-6 animate-spin text-[var(--card-subtitle)]" /></div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
