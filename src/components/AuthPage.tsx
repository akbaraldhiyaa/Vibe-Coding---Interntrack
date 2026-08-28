"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { useInternTrackStore } from "@/shared/store/useInternTrackStore";
import { registerUser, verifyRegistrationOTP, resendRegistrationOTP, requestPasswordReset } from "@/app/actions/auth";
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
  AlertTriangle,
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import OnboardingPage from "./OnboardingPage";
import { signInWithPopup } from "firebase/auth";
import { auth as firebaseAuth, googleProvider } from "@/lib/firebase";

export default function AuthPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { userProfile, updateUserProfile } = useInternTrackStore();

  const [authMode, setAuthMode] = useState<"auth" | "forgot-password" | "onboarding" | "google-unlinked" | "google-new" | "otp-verification">("auth");
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

      if ((session.user as any).setupComplete === false) {
        setAuthMode("onboarding");
      } else {
        router.push("/dashboard");
      }
    } else if (status === "unauthenticated") {
      // IMPORTANT: do NOT reset authMode if we're in onboarding.
      // New Google users are unauthenticated during onboarding by design.
      setIsGoogleLoading(false);
      setIsLoading(false);
    }
  }, [status, session, userProfile.email, updateUserProfile, router]);

  const [activeTab, setActiveTab] = useState<"masuk" | "daftar">("masuk");
  const [showPassword, setShowPassword] = useState(false);

  // Form state for Login / Register
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Siswa");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [pendingGoogleUser, setPendingGoogleUser] = useState<{ idToken: string; email: string; name: string } | null>(null);

  // Form state for OTP Verification
  const [otp, setOtp] = useState("");
  const [registrationEmail, setRegistrationEmail] = useState("");
  const [otpCooldown, setOtpCooldown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (otpCooldown > 0) {
      timer = setInterval(() => setOtpCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [otpCooldown]);

  // Form state for Forgot Password
  const [forgotEmail, setForgotEmail] = useState("");
  const [isForgotLoading, setIsForgotLoading] = useState(false);
  const [isForgotSubmitted, setIsForgotSubmitted] = useState(false);

  const isValidEmail = (emailStr: string) => /\S+@\S+\.\S+/.test(emailStr.trim());

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setIsGoogleLoading(true);
    try {
      const result = await signInWithPopup(firebaseAuth, googleProvider);
      const idToken = await result.user.getIdToken();

      console.log("[Google Auth] Firebase token obtained:", !!idToken);
      console.log("[Google Auth] Firebase UID:", !!result.user.uid);
      console.log("[Google Auth] Firebase email:", !!result.user.email);

      // Sign in using our NextAuth CredentialsProvider (Firebase bridge)
      const res = await signIn("credentials", {
        idToken,
        redirect: false,
      });

      console.log("[Google Auth] NextAuth signIn result:", { ok: res?.ok, error: res?.error, status: res?.status });

      if (res?.ok && !res?.error) {
        // Successfully authenticated — the useEffect will detect the new
        // session and push to /dashboard. Add an explicit push as backup.
        router.push("/dashboard");
      } else if (res?.error === "EXISTING_EMAIL_NOT_LINKED") {
        setAuthMode("google-unlinked");
        setIsGoogleLoading(false);
      } else {
        // No existing linked account — route to google-new for confirmation
        console.log("[Google Auth] No linked account found, routing to google-new state");
        setPendingGoogleUser({
          idToken,
          email: result.user.email || "",
          name: result.user.displayName || "Google User",
        });
        setIsGoogleLoading(false);
        setAuthMode("google-new");
      }
    } catch (err: any) {
      console.error("Google Sign-In Error:", err);
      if (err.code === "auth/popup-closed-by-user") {
        setAuthError("Masuk dengan Google dibatalkan.");
      } else {
        setAuthError("Terjadi kesalahan saat masuk dengan Google.");
      }
      setIsGoogleLoading(false);
    }
  };

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
          login: trimmedEmail,
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
        const trimmedUsername = username.trim().toLowerCase();

        if (!trimmedUsername || !/^[a-z0-9_]{3,20}$/.test(trimmedUsername)) {
          setAuthError("Username harus 3-20 karakter (huruf kecil, angka, _).");
          setIsLoading(false);
          return;
        }

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
          username: trimmedUsername,
          fullName: trimmedFullName,
          email: trimmedEmail,
          password,
          role,
        });

        if (!regRes.success) {
          setAuthError(regRes.error || "Gagal mendaftar.");
          setIsLoading(false);
          return;
        }

        if (regRes.pending) {
          setRegistrationEmail(trimmedEmail);
          setAuthMode("otp-verification");
          setOtpCooldown(60);
          setIsLoading(false);
          return;
        }

        // Fallback if not pending
        setAuthMode("onboarding");
        setIsLoading(false);
      }
    } catch (err: any) {
      setAuthError("Terjadi kesalahan pada sistem. Silakan coba lagi.");
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(forgotEmail)) return;

    setIsForgotLoading(true);
    setAuthError(null);
    try {
      const res = await requestPasswordReset(forgotEmail);
      if (res.success) {
        setIsForgotSubmitted(true);
      } else {
        // Technically for anti-enumeration we only fail on actual rate-limit
        setAuthError(res.error || "Gagal memproses permintaan.");
      }
    } catch (err: any) {
      setAuthError("Terjadi kesalahan sistem. Silakan coba lagi.");
    } finally {
      setIsForgotLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!otp || otp.length < 6) {
      setAuthError("Masukkan 6 digit kode OTP.");
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await verifyRegistrationOTP(registrationEmail, otp);
      if (!res.success) {
        setAuthError(res.error || "Gagal memverifikasi OTP.");
        setIsLoading(false);
        return;
      }
      
      // Auto login after verification
      const loginRes = await signIn("credentials", {
        login: registrationEmail,
        password, // we stored this in state during registration
        redirect: false,
      });

      if (loginRes?.error || !loginRes?.ok) {
        setAuthError("Akun berhasil dibuat tetapi gagal masuk otomatis. Silakan masuk manual.");
        setAuthMode("auth");
        setActiveTab("masuk");
        setIsLoading(false);
        return;
      }

      setAuthMode("onboarding");
      setIsLoading(false);
    } catch (err) {
      setAuthError("Terjadi kesalahan pada sistem.");
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (otpCooldown > 0) return;
    
    setAuthError(null);
    setIsLoading(true);
    try {
      const res = await resendRegistrationOTP(registrationEmail);
      if (res.success) {
        setOtpCooldown(60);
      } else {
        setAuthError(res.error || "Gagal mengirim ulang OTP.");
      }
    } catch (err) {
      setAuthError("Terjadi kesalahan sistem saat mengirim ulang.");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center" suppressHydrationWarning>
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" suppressHydrationWarning></div>
      </div>
    );
  }

  if (authMode === "onboarding") {
    return (
      <OnboardingPage
        pendingGoogleUser={pendingGoogleUser}
        onBackToAuth={() => {
           setAuthMode("auth");
           setPendingGoogleUser(null);
        }}
        onComplete={async () => {
          if (pendingGoogleUser) {
             // Force-refresh the token here too — registerGoogleUser already ran with
             // a fresh token from OnboardingPage, but the signIn call below also
             // goes through verifyIdToken on the server, so it needs a fresh token.
             let freshIdToken = pendingGoogleUser.idToken;
             try {
               const { auth: firebaseAuth } = await import("@/lib/firebase");
               const currentUser = firebaseAuth.currentUser;
               if (currentUser) {
                 freshIdToken = await currentUser.getIdToken(true);
               }
             } catch (tokenErr) {
               console.error("[AuthPage] Failed to refresh Firebase token for signIn:", tokenErr);
             }
             const res = await signIn("credentials", {
                idToken: freshIdToken,
                redirect: false
             });
             if (res?.error) {
                setAuthError("Gagal masuk otomatis setelah pendaftaran Google.");
                setAuthMode("auth");
                setPendingGoogleUser(null);
             } else {
                router.push("/dashboard");
             }
          } else {
             router.push("/dashboard");
          }
        }}
      />
    );
  }

  return (
    <div suppressHydrationWarning className="min-h-screen w-full flex flex-col lg:flex-row bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300 relative">
      {/* DESKTOP THEME TOGGLE — Anchored at far-right of the full viewport */}
      <div suppressHydrationWarning className="hidden lg:block absolute top-6 right-6 xl:top-8 xl:right-8 z-50">
        <ThemeToggle />
      </div>

      {/* LEFT PANEL - DARK HERO / BRAND SECTION */}
      <div className="w-full lg:w-1/2 bg-[var(--hero-bg)] text-[var(--hero-text)] flex flex-col justify-between p-6 sm:p-10 lg:p-16 min-h-[460px] sm:min-h-[520px] lg:min-h-screen relative overflow-hidden transition-colors duration-300">
        {/* Subtle Background Radial Glow */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Logo & Header with Integrated Mobile/Tablet ThemeToggle */}
        <div className="relative z-10 flex items-center justify-between gap-3 w-full pb-6 sm:pb-8 lg:pb-0">
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-800/80 border border-slate-700/60 flex items-center justify-center shadow-inner shrink-0">
              <GraduationCap className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-slate-200" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold tracking-tight text-white leading-tight truncate">
                InternTrack
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 font-normal truncate">SMKN 3 Jakarta</p>
            </div>
          </div>
          {/* Mobile & Tablet ThemeToggle (in-flow header item) */}
          <div className="shrink-0 ml-auto lg:hidden">
            <ThemeToggle />
          </div>
        </div>

        {/* Middle Main Content */}
        <div className="relative z-10 max-w-xl my-auto py-6 sm:py-8 lg:py-0">
          <h1 className="text-2xl sm:text-4xl lg:text-[42px] font-bold text-white leading-[1.2] tracking-tight">
            Satu tempat untuk seluruh siklus PKL
          </h1>
          <p className="text-slate-400 text-xs sm:text-base leading-relaxed mt-3 sm:mt-4 font-normal max-w-lg">
            Penempatan, absensi QR, jurnal harian, penilaian, hingga sertifikat
            terpantau real-time oleh sekolah, pembimbing, dan industri.
          </p>

          {/* Bulleted list of features */}
          <ul className="mt-6 sm:mt-8 space-y-2.5 sm:space-y-3 text-xs sm:text-base text-slate-200">
            <li className="flex items-start gap-2.5 sm:gap-3">
              <span className="w-2 h-2 rounded-full bg-[#3B82F6] shrink-0 mt-1.5 sm:mt-2 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
              <span>Kanban tahapan PKL yang selalu sinkron</span>
            </li>
            <li className="flex items-start gap-2.5 sm:gap-3">
              <span className="w-2 h-2 rounded-full bg-[#3B82F6] shrink-0 mt-1.5 sm:mt-2 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
              <span>Absensi berbasis QR dengan deteksi anomali</span>
            </li>
            <li className="flex items-start gap-2.5 sm:gap-3">
              <span className="w-2 h-2 rounded-full bg-[#3B82F6] shrink-0 mt-1.5 sm:mt-2 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
              <span>Jurnal harian terverifikasi pembimbing</span>
            </li>
          </ul>
        </div>

        {/* Bottom Footer */}
        <div suppressHydrationWarning className="relative z-10 text-[11px] sm:text-xs text-slate-400 font-normal pt-6 lg:pt-0">
          © 2026 InternTrack. Semua data terenkripsi.
        </div>
      </div>

      {/* RIGHT PANEL - AUTHENTICATION CARD / FORGOT PASSWORD CARD */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-4 sm:p-8 lg:p-12 py-8 sm:py-12 lg:py-0 lg:min-h-screen">
        {authMode === "google-unlinked" ? (
          /* STATE B: EXISTING EMAIL, NOT LINKED */
          <div className="w-full max-w-[440px] bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl sm:rounded-3xl p-6 sm:p-9 shadow-[var(--card-shadow)] transition-all animate-fadeIn">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-[var(--card-title)] leading-tight">
                Akun Google belum terhubung
              </h2>
            </div>
            <p className="text-sm text-[var(--card-subtitle)] leading-relaxed mb-6">
              Email ini sudah memiliki akun InternTrack, tetapi Google belum terhubung ke akun tersebut.
              <br /><br />
              Masuk dengan username/email + password terlebih dahulu, lalu hubungkan Google melalui <strong>Pengaturan</strong>.
            </p>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("auth");
                  setActiveTab("masuk");
                }}
                className="w-full token-btn-primary py-3 rounded-xl text-sm font-semibold shadow-sm cursor-pointer transition-all active:scale-[0.99]"
              >
                Masuk dengan Username / Email
              </button>
              <button
                type="button"
                onClick={() => setAuthMode("auth")}
                className="w-full py-3 rounded-xl text-sm font-semibold bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] text-[var(--btn-secondary-text)] border border-[var(--btn-secondary-border)] cursor-pointer transition-all active:scale-[0.99]"
              >
                Kembali
              </button>
            </div>
          </div>
        ) : authMode === "google-new" ? (
          /* STATE A: NEW GOOGLE USER */
          <div className="w-full max-w-[440px] bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl sm:rounded-3xl p-6 sm:p-9 shadow-[var(--card-shadow)] transition-all animate-fadeIn">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <User className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-[var(--card-title)] leading-tight">
                Email Google belum terdaftar
              </h2>
            </div>
            <p className="text-sm text-[var(--card-subtitle)] leading-relaxed mb-6">
              Akun baru akan dibuat di InternTrack menggunakan email <strong>{pendingGoogleUser?.email}</strong>. Lanjutkan untuk mengisi data profil.
            </p>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setAuthMode("onboarding")}
                className="w-full token-btn-primary py-3 rounded-xl text-sm font-semibold shadow-sm cursor-pointer transition-all active:scale-[0.99]"
              >
                Lanjutkan Daftar
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("auth");
                  setPendingGoogleUser(null);
                }}
                className="w-full py-3 rounded-xl text-sm font-semibold bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] text-[var(--btn-secondary-text)] border border-[var(--btn-secondary-border)] cursor-pointer transition-all active:scale-[0.99]"
              >
                Batal
              </button>
            </div>
          </div>
        ) : authMode === "otp-verification" ? (
          /* STATE D: OTP VERIFICATION */
          <div className="w-full max-w-[440px] bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl sm:rounded-3xl p-6 sm:p-9 shadow-[var(--card-shadow)] transition-all animate-fadeIn">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-[var(--card-title)] leading-tight">
                Verifikasi Email
              </h2>
            </div>
            
            {authError && (
              <div className="mb-6 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 flex items-start gap-2.5 animate-in slide-in-from-top-1">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                <p className="text-sm text-red-600 dark:text-red-400 font-medium">{authError}</p>
              </div>
            )}

            <p className="text-sm text-[var(--card-subtitle)] leading-relaxed mb-6">
              Kode verifikasi telah dikirim ke email kamu.<br /><strong>{registrationEmail}</strong>
            </p>

            <form onSubmit={handleVerifyOTP} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-[var(--foreground)] mb-2 tracking-wide uppercase">
                  Masukkan kode OTP
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="------"
                  className="w-full px-4 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--foreground)] text-center tracking-[1em] text-xl font-bold font-mono placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  autoComplete="one-time-code"
                  disabled={isLoading}
                />
                <p className="text-xs text-[var(--muted-foreground)] mt-3">
                  Kode berlaku selama 10 menit.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  type="submit"
                  disabled={isLoading || otp.length < 6}
                  className="w-full token-btn-primary py-3 rounded-xl text-sm font-semibold shadow-sm cursor-pointer transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Verifikasi
                </button>
                
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={isLoading || otpCooldown > 0}
                  className="w-full py-3 rounded-xl text-sm font-semibold bg-transparent hover:bg-[var(--surface)] text-blue-600 dark:text-blue-400 border border-transparent cursor-pointer transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {otpCooldown > 0 ? `Kirim ulang dalam ${otpCooldown} detik` : "Kirim ulang kode"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("auth");
                    setOtp("");
                  }}
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl text-sm font-semibold bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] text-[var(--btn-secondary-text)] border border-[var(--btn-secondary-border)] cursor-pointer transition-all active:scale-[0.99] disabled:opacity-50"
                >
                  Kembali
                </button>
              </div>
            </form>
          </div>
        ) : authMode === "auth" ? (
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
              onClick={handleGoogleSignIn}
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
              {/* Email/Username Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {activeTab === "masuk" ? "Username atau Email" : "Email"}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--token-text-muted)]">
                    {activeTab === "masuk" ? <User className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                  </div>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full token-input pl-10 pr-4 py-2.5 text-sm"
                    placeholder={activeTab === "masuk" ? "Masukkan username atau email" : "nama@sekolah.sch.id"}
                    required
                  />
                </div>
              </div>

              {/* Username Field (Only for Register) */}
              {activeTab === "daftar" && (
                <>
                  <div className="space-y-1.5 animate-fadeIn">
                    <label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Username
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--token-text-muted)]">
                        <User className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full token-input pl-10 pr-4 py-2.5 text-sm"
                        placeholder="johndoe_123"
                        required
                      />
                    </div>
                  </div>

                  {/* Full Name field */}
                  <div className="space-y-1.5 animate-fadeIn">
                    <label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Nama Lengkap
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--token-text-muted)]">
                        <User className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full token-input pl-10 pr-4 py-2.5 text-sm"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                  </div>
                </>
              )}



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
                      <span>{activeTab === "masuk" ? "Memverifikasi..." : "Memproses pendaftaran..."}</span>
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

            {/* Error Alert */}
            {authError && !isForgotSubmitted && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs font-medium flex items-center gap-2.5 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
                <span>{authError}</span>
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
