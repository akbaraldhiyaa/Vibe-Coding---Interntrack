"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { useInternTrackStore } from "@/shared/store/useInternTrackStore";
import { registerUser } from "@/app/actions/auth";
import {
  GraduationCap,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import OnboardingPage from "./OnboardingPage";

export default function AuthPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { userProfile, updateUserProfile } = useInternTrackStore();

  const [authMode, setAuthMode] = useState<"auth" | "forgot-password" | "onboarding">("auth");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      setIsGoogleLoading(false);
      setIsLoading(false);
      // Sync user with our local store
      if (userProfile.email !== session.user.email) {
        updateUserProfile({
          email: session.user.email || "",
          fullName: session.user.name || "",
        });
      }
      router.push("/dashboard");
    } else if (status === "unauthenticated") {
      setAuthMode("auth");
      setIsGoogleLoading(false);
      setIsLoading(false);
    }
  }, [status, session, userProfile.email, updateUserProfile, router]);

  const [activeTab, setActiveTab] = useState<"masuk" | "daftar">("masuk");
  const [showPassword, setShowPassword] = useState(false);

  // Form state for Login / Register
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Siswa");
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Form state for Forgot Password
  const [forgotEmail, setForgotEmail] = useState("");
  const [isForgotLoading, setIsForgotLoading] = useState(false);
  const [isForgotSubmitted, setIsForgotSubmitted] = useState(false);

  const isValidEmail = (emailStr: string) => /\S+@\S+\.\S+/.test(emailStr.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setAuthError("Email wajib diisi.");
      return;
    }
    if (!isValidEmail(trimmedEmail)) {
      setAuthError("Format email tidak valid.");
      return;
    }
    if (!password) {
      setAuthError("Kata sandi wajib diisi.");
      return;
    }

    setIsLoading(true);

    try {
      if (activeTab === "masuk") {
        const res = await signIn("credentials", {
          email: trimmedEmail.toLowerCase(),
          password,
          redirect: false,
        });

        if (res?.error || !res?.ok) {
          setAuthError("Email atau kata sandi salah.");
          setIsLoading(false);
          return;
        }

        setIsSubmitted(true);
      } else {
        // Register tab
        const trimmedFullName = fullName.trim();
        if (!trimmedFullName || trimmedFullName.length < 3) {
          setAuthError("Nama lengkap minimal 3 karakter.");
          setIsLoading(false);
          return;
        }
        if (password.length < 6) {
          setAuthError("Kata sandi minimal 6 karakter.");
          setIsLoading(false);
          return;
        }

        const regRes = await registerUser({
          fullName: trimmedFullName,
          email: trimmedEmail,
          password,
          role,
        });

        if (!regRes.success) {
          setAuthError(regRes.error || "Gagal membuat akun.");
          setIsLoading(false);
          return;
        }

        // Automatically sign in
        const res = await signIn("credentials", {
          email: trimmedEmail.toLowerCase(),
          password,
          redirect: false,
        });

        if (res?.error || !res?.ok) {
          setAuthError("Akun berhasil dibuat. Silakan masuk.");
          setActiveTab("masuk");
          setIsLoading(false);
          return;
        }

        setIsSubmitted(true);
        setAuthMode("onboarding");
      }
    } catch (err: any) {
      setAuthError("Terjadi kesalahan pada sistem. Silakan coba lagi.");
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(forgotEmail)) return;

    setIsForgotLoading(true);
    setTimeout(() => {
      setIsForgotLoading(false);
      setIsForgotSubmitted(true);
    }, 1500);
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (authMode === "onboarding") {
    return (
      <OnboardingPage
        onBackToAuth={() => setAuthMode("auth")}
        onComplete={() => {
          router.push("/dashboard");
        }}
      />
    );
  }

  return (
    <div suppressHydrationWarning className="min-h-screen w-full flex flex-col lg:flex-row bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300 relative">
      <div suppressHydrationWarning className="absolute top-4 right-4 z-50">
        <ThemeToggle showLabel />
      </div>

      {/* LEFT PANEL - DARK HERO / BRAND SECTION */}
      <div className="w-full lg:w-1/2 bg-[var(--hero-bg)] text-[var(--hero-text)] flex flex-col justify-between p-8 sm:p-12 lg:p-16 min-h-[480px] lg:min-h-screen relative overflow-hidden transition-colors duration-300">
        {/* Subtle Background Radial Glow */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Logo & Header */}
        <div className="relative z-10 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-slate-800/80 border border-slate-700/60 flex items-center justify-center shadow-inner shrink-0">
            <GraduationCap className="w-5 h-5 text-slate-200" />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight text-white leading-tight">
              InternTrack
            </h2>
            <p className="text-xs text-slate-400 font-normal">SMKN 3 Jakarta</p>
          </div>
        </div>

        {/* Middle Main Content */}
        <div className="relative z-10 max-w-xl my-auto py-12 lg:py-0">
          <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-white leading-[1.2] tracking-tight">
            Satu tempat untuk seluruh siklus PKL
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed mt-4 font-normal max-w-lg">
            Penempatan, absensi QR, jurnal harian, penilaian, hingga sertifikat
            terpantau real-time oleh sekolah, pembimbing, dan industri.
          </p>

          {/* Bulleted list of features */}
          <ul className="mt-8 space-y-3 text-sm sm:text-base text-slate-200">
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-[#3B82F6] shrink-0 mt-2 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
              <span>Kanban tahapan PKL yang selalu sinkron</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-[#3B82F6] shrink-0 mt-2 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
              <span>Absensi berbasis QR dengan deteksi anomali</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-[#3B82F6] shrink-0 mt-2 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
              <span>Jurnal harian terverifikasi pembimbing</span>
            </li>
          </ul>
        </div>

        {/* Bottom Footer */}
        <div suppressHydrationWarning className="relative z-10 text-xs text-slate-400 font-normal pt-6 lg:pt-0">
          © 2026 InternTrack. Semua data terenkripsi.
        </div>
      </div>

      {/* RIGHT PANEL - AUTHENTICATION CARD / FORGOT PASSWORD CARD */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-4 sm:p-8 lg:p-12 min-h-[100dvh] lg:min-h-screen py-12 lg:py-0">
        {authMode === "auth" ? (
          /* LOGIN / REGISTER CARD */
          <div className="w-full max-w-[440px] bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl sm:rounded-3xl p-6 sm:p-9 shadow-[var(--card-shadow)] transition-all">
            {/* Card Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-[var(--card-title)]">
                {activeTab === "masuk" ? "Masuk ke akunmu" : "Buat akun baru"}
              </h2>
              <p className="text-sm text-[var(--card-subtitle)] mt-1">
                {activeTab === "masuk"
                  ? "Gunakan akun yang terdaftar"
                  : "Daftar untuk mulai memantau kegiatan PKL."}
              </p>
            </div>

            {/* Social Sign-in Button */}
            <button
              type="button"
              onClick={() => {
                setIsGoogleLoading(true);
                signIn("google");
              }}
              disabled={isGoogleLoading}
              className={`w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] text-[var(--btn-secondary-text)] border border-[var(--btn-secondary-border)] text-sm font-semibold transition-all ${
                isGoogleLoading ? "opacity-70 cursor-not-allowed" : "active:scale-[0.99] cursor-pointer"
              }`}
            >
              {isGoogleLoading ? (
                <Loader2 className="w-4 h-4 shrink-0 animate-spin" />
              ) : (
                /* Multicolor Google G Logo SVG */
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.15C3.26 21.3 7.31 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.29C.47 8.21 0 10.05 0 12s.47 3.79 1.29 5.42l3.99-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.58l3.99 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
              )}
              <span>{isGoogleLoading ? "Memproses..." : "Lanjutkan dengan Google"}</span>
            </button>

            {/* Divider */}
            <div className="relative my-5 flex items-center justify-center">
              <div className="w-full border-t border-[var(--divider-border)]" />
              <span className="absolute bg-[var(--divider-bg)] px-3 text-[11px] font-semibold tracking-wider uppercase text-[var(--divider-text)]">
                ATAU
              </span>
            </div>

            {/* Segmented Tab Bar (Masuk / Daftar) */}
            <div className="bg-[var(--tab-bg)] p-1 rounded-full flex items-center mb-6">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("masuk");
                  setAuthError(null);
                }}
                className={`flex-1 py-2 rounded-full text-sm font-medium transition-all text-center cursor-pointer ${
                  activeTab === "masuk"
                    ? "bg-[var(--tab-active-bg)] text-[var(--tab-active-text)] shadow-[var(--tab-active-shadow)] font-semibold"
                    : "text-[var(--tab-inactive-text)] hover:text-[var(--foreground)]"
                }`}
              >
                Masuk
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("daftar");
                  setAuthError(null);
                }}
                className={`flex-1 py-2 rounded-full text-sm font-medium transition-all text-center cursor-pointer ${
                  activeTab === "daftar"
                    ? "bg-[var(--tab-active-bg)] text-[var(--tab-active-text)] shadow-[var(--tab-active-shadow)] font-semibold"
                    : "text-[var(--tab-inactive-text)] hover:text-[var(--foreground)]"
                }`}
              >
                Daftar
              </button>
            </div>

            {/* Error Alert */}
            {authError && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs font-medium flex items-center gap-2.5 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
                <span>{authError}</span>
              </div>
            )}

            {/* Success Toast / Notification */}
            {isSubmitted && (
              <div className="mb-5 p-3.5 rounded-xl bg-[var(--badge-success-bg)] border border-[var(--badge-success-border)] text-[var(--badge-success-text)] text-xs font-medium flex items-center gap-2.5 animate-fadeIn">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>
                  {activeTab === "daftar"
                    ? "Pendaftaran berhasil! Mengalihkan ke pengisian profil..."
                    : "Berhasil masuk! Mengalihkan ke dashboard..."}
                </span>
              </div>
            )}

            {/* Main Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name field (Only shown on "Daftar") */}
              {activeTab === "daftar" && (
                <div>
                  <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--input-placeholder)]">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (authError) setAuthError(null);
                      }}
                      placeholder="Nama Lengkap"
                      className="w-full token-input pl-10 pr-3.5 py-2.5 text-sm"
                    />
                  </div>
                </div>
              )}

              {/* Email Field */}
              <div>
                <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--input-placeholder)]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (authError) setAuthError(null);
                    }}
                    placeholder="Email"
                    className="w-full token-input pl-10 pr-3.5 py-2.5 text-sm"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-[var(--foreground)]">
                    Kata sandi <span className="text-red-500">*</span>
                  </label>
                  {activeTab === "masuk" && (
                    <button
                      type="button"
                      onClick={() => {
                        setForgotEmail(email);
                        setAuthMode("forgot-password");
                      }}
                      className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline transition-colors cursor-pointer"
                    >
                      Lupa kata sandi?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--input-placeholder)]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (authError) setAuthError(null);
                    }}
                    placeholder="••••••••"
                    className="w-full token-input pl-10 pr-10 py-2.5 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[var(--input-placeholder)] hover:text-[var(--foreground)] transition cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Role Select Field (Only shown on "Daftar") */}
              {activeTab === "daftar" && (
                <div>
                  <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">
                    Peran <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full token-input appearance-none pl-3.5 pr-10 py-2.5 text-sm cursor-pointer"
                    >
                      <option value="Siswa" className="bg-[var(--dropdown-bg)] text-[var(--dropdown-text)]">
                        Siswa
                      </option>
                      <option value="Pembimbing Sekolah" className="bg-[var(--dropdown-bg)] text-[var(--dropdown-text)]">
                        Pembimbing Sekolah
                      </option>
                      <option value="Pembimbing Industri" className="bg-[var(--dropdown-bg)] text-[var(--dropdown-text)]">
                        Pembimbing Industri
                      </option>
                      <option value="Admin" className="bg-[var(--dropdown-bg)] text-[var(--dropdown-text)]">
                        Admin
                      </option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[var(--input-placeholder)]">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full token-btn-primary py-3 px-4 shadow-sm text-sm font-semibold tracking-wide cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{activeTab === "masuk" ? "Memverifikasi..." : "Mendaftarkan..."}</span>
                    </>
                  ) : (
                    <span>{activeTab === "masuk" ? "Masuk" : "Buat akun"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* FORGOT PASSWORD CARD (FIGMA DESIGN 1:1) */
          <div className="w-full max-w-[440px] bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl sm:rounded-3xl p-6 sm:p-9 shadow-[var(--card-shadow)] transition-all">
            {/* Card Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-[var(--card-title)]">
                Lupa kata sandi?
              </h2>
              <p className="text-sm text-[var(--card-subtitle)] mt-1.5 leading-relaxed font-normal">
                Masukkan emailmu, kami kirim tautan untuk mengganti kata sandi.
              </p>
            </div>

            {/* Success Alert */}
            {isForgotSubmitted && (
              <div className="mb-5 p-4 rounded-xl bg-[var(--badge-success-bg)] border border-[var(--badge-success-border)] text-[var(--badge-success-text)] text-xs font-medium flex items-start gap-3 animate-fadeIn">
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">Tautan reset berhasil dikirim!</p>
                  <p className="mt-1 leading-relaxed opacity-90">
                    Kami telah mengirim tautan pemulihan ke <strong>{forgotEmail}</strong>. Silakan periksa kotak masuk email Anda.
                  </p>
                </div>
              </div>
            )}

            {/* Forgot Password Form */}
            <form onSubmit={handleForgotSubmit} className="space-y-5">
              {/* Email Field */}
              <div>
                <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--input-placeholder)]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => {
                      setForgotEmail(e.target.value);
                      if (isForgotSubmitted) setIsForgotSubmitted(false);
                    }}
                    placeholder="Email"
                    className="w-full token-input pl-10 pr-3.5 py-2.5 text-sm"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={!isValidEmail(forgotEmail) || isForgotLoading}
                  className={`w-full py-3 px-4 rounded-xl text-sm font-semibold tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 ${
                    isValidEmail(forgotEmail) && !isForgotLoading
                      ? "bg-[#1E3A8A] hover:bg-[#122353] text-white active:scale-[0.99] cursor-pointer"
                      : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-500 cursor-not-allowed border border-slate-200/50 dark:border-slate-800"
                  }`}
                >
                  {isForgotLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Mengirim tautan reset...</span>
                    </>
                  ) : (
                    <span>Kirim tautan reset</span>
                  )}
                </button>
              </div>

              {/* Return to Login Link */}
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("auth");
                    setActiveTab("masuk");
                    setIsForgotSubmitted(false);
                  }}
                  className="text-xs text-[var(--card-subtitle)] hover:text-[var(--foreground)] transition-colors font-medium cursor-pointer"
                >
                  Kembali ke halaman masuk
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
