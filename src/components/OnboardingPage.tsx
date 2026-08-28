"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { completeOnboarding } from "@/app/actions/auth";
import {
  GraduationCap,
  Check,
  ArrowRight,
  ArrowLeft,
  Building,
  UserCheck,
  MessageCircle,
  AlertCircle
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";

interface OnboardingPageProps {
  onComplete?: () => void;
  onBackToAuth?: () => void;
  pendingGoogleUser?: { idToken: string; email: string; name: string } | null;
}

export type RoleType = "siswa" | "pembimbing" | "admin";

export default function OnboardingPage({ onComplete, onBackToAuth, pendingGoogleUser }: OnboardingPageProps) {
  const { update } = useSession();
  const [step, setStep] = useState<number>(1);
  const [selectedRole, setSelectedRole] = useState<RoleType>("siswa");
  const [isRegistering, setIsRegistering] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Step 2 Form States (Data Diri)
  const [idNumber, setIdNumber] = useState("");
  const [institution, setInstitution] = useState("SMKN 3 Jakarta");
  const [department, setDepartment] = useState("Rekayasa Perangkat Lunak");
  const [whatsapp, setWhatsapp] = useState("");
  const [whatsappError, setWhatsappError] = useState("");

  // Step 3 Form States (Preferensi Notifikasi)
  const [emailNotification, setEmailNotification] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  const [isFinished, setIsFinished] = useState(false);

  const roles = [
    {
      id: "siswa" as RoleType,
      title: "Siswa",
      description: "Isi jurnal harian, absensi QR, dan pantau progres PKL sendiri.",
    },
    {
      id: "pembimbing" as RoleType,
      title: "Pembimbing / Guru",
      description: "Verifikasi jurnal, nilai siswa bimbingan, dan pantau penempatan.",
    },
    {
      id: "admin" as RoleType,
      title: "Admin Sekolah",
      description: "Kelola data master, penempatan, laporan, dan audit log sekolah.",
    },
  ];

  const validateWhatsApp = (val: string): boolean => {
    const trimmed = val.trim();
    if (!trimmed) {
      setWhatsappError("");
      return true;
    }
    // Indonesian phone number format regex: 08xx or +628xx or 628xx (8 to 13 digits after prefix)
    const waRegex = /^(?:\+62|62|0)8[1-9][0-9]{7,11}$/;
    if (!waRegex.test(trimmed)) {
      setWhatsappError("Format nomor WhatsApp tidak valid. Contoh: 08123456789 atau +628123456789");
      return false;
    }
    setWhatsappError("");
    return true;
  };

  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setWhatsapp(val);
    if (whatsappError) {
      validateWhatsApp(val);
    }
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (whatsapp && !validateWhatsApp(whatsapp)) {
      return;
    }
    handleNextStep();
  };

  const handleNextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleFinish = async () => {
    setErrorMsg(null);
    setIsRegistering(true);

    try {
      let roleString = "Siswa";
      if (selectedRole === "pembimbing") roleString = "Guru Pembimbing";
      if (selectedRole === "admin") roleString = "Admin";

      if (pendingGoogleUser) {
        // We need to register the Google user!
        const { registerGoogleUser } = await import("@/app/actions/auth");
        
        const res = await registerGoogleUser({
          fullName: pendingGoogleUser.name,
          role: roleString,
          idToken: pendingGoogleUser.idToken,
          institution,
          department,
          whatsapp,
          idNumber,
        });

        if (!res.success) {
          setErrorMsg(res.error || "Gagal membuat akun.");
          setIsRegistering(false);
          return;
        }
      } else {
        // We need to complete onboarding for the authenticated manual user
        const res = await completeOnboarding({
          role: roleString,
          institution,
          department,
          whatsapp,
          idNumber,
        });

        if (!res.success) {
          setErrorMsg(res.error || "Gagal melengkapi profil.");
          setIsRegistering(false);
          return;
        }

        // Refresh the session token so setupComplete becomes true
        await update({ setupComplete: true });
      }

      // Proceed to complete (which logs them in or routes them)
      setIsFinished(true);
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 1500);
    } catch (err) {
      console.error(err);
      setErrorMsg("Terjadi kesalahan sistem.");
      setIsRegistering(false);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    } else if (onBackToAuth) {
      onBackToAuth();
    }
  };

  return (
    <div className="min-h-screen w-full bg-[var(--background)] text-[var(--foreground)] flex flex-col items-center justify-center p-4 sm:p-6 transition-colors duration-300 relative">
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle showLabel />
      </div>

      {/* TOP HEADER SECTION */}
      <div className="w-full max-w-[500px] mb-8">
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-10 h-10 rounded-full bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-inner">
            <GraduationCap className="w-5 h-5 text-slate-100" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-[var(--foreground)] leading-tight">
              Lengkapi profilmu
            </h2>
            <p className="text-xs text-[var(--card-subtitle)] font-medium mt-0.5">
              Langkah {step} dari 3 · {step === 1 ? "Peran" : step === 2 ? "Data Diri" : "Preferensi"}
            </p>
          </div>
        </div>

        {/* STEP PROGRESS BAR */}
        <div className="grid grid-cols-3 gap-2.5 w-full">
          <div
            className={`h-1.5 rounded-full transition-all duration-300 ${
              step >= 1 ? "bg-slate-900 dark:bg-blue-500" : "bg-slate-200 dark:bg-slate-800"
            }`}
          />
          <div
            className={`h-1.5 rounded-full transition-all duration-300 ${
              step >= 2 ? "bg-slate-900 dark:bg-blue-500" : "bg-slate-200 dark:bg-slate-800"
            }`}
          />
          <div
            className={`h-1.5 rounded-full transition-all duration-300 ${
              step >= 3 ? "bg-slate-900 dark:bg-blue-500" : "bg-slate-200 dark:bg-slate-800"
            }`}
          />
        </div>
      </div>

      {/* MAIN CONTENT CARD */}
      <div className="w-full max-w-[500px] bg-white dark:bg-[#141822] border border-slate-200/90 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-6 sm:p-9 shadow-lg shadow-slate-200/50 dark:shadow-none transition-all">
        {step === 1 && (
          /* STEP 1: ROLE SELECTION (FIGMA 1:1 AUDITED FOR LIGHT/DARK MODE) */
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Kamu bergabung sebagai?
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed font-normal">
                Peran menentukan modul yang tampil di dashboard.
              </p>
            </div>

            {/* RADIO CARDS */}
            <div className="space-y-3.5 mb-8">
              {roles.map((r) => {
                const isSelected = selectedRole === r.id;
                return (
                  <div
                    key={r.id}
                    onClick={() => setSelectedRole(r.id)}
                    className={`relative p-4 sm:p-5 rounded-2xl transition-all cursor-pointer border flex items-start gap-4 ${
                      isSelected
                        ? "border-2 border-slate-900 dark:border-blue-500 bg-slate-50/80 dark:bg-slate-800/40 shadow-xs"
                        : "border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900"
                    }`}
                  >
                    {/* CUSTOM RADIO ICON */}
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                        isSelected
                          ? "bg-slate-900 dark:bg-blue-500 text-white border-2 border-slate-900 dark:border-blue-500"
                          : "border-2 border-slate-300 dark:border-slate-700 bg-transparent"
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>

                    {/* CONTENT */}
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                        {r.title}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed font-normal">
                        {r.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ACTION BUTTON */}
            <button
              type="button"
              onClick={handleNextStep}
              className="w-full py-3 px-4 rounded-xl bg-[#1E3A8A] hover:bg-[#122353] active:scale-[0.99] text-white text-sm font-semibold tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Lanjut</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 2 && (
          /* STEP 2: DATA DIRI WITH NOMOR WHATSAPP FIELD */
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Informasi Data Diri
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed font-normal">
                Lengkapi identitas & kontak Anda untuk keperluan verifikasi.
              </p>
            </div>

            <form onSubmit={handleStep2Submit} className="space-y-4 mb-8">
              {/* ID Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                  {selectedRole === "siswa" ? "NISN / Nomor Induk Siswa" : "NIP / NIK Pembimbing"} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  placeholder={selectedRole === "siswa" ? "Contoh: 0054819231" : "Contoh: 19850312..."}
                  className="w-full token-input px-3.5 py-2.5 text-sm"
                />
              </div>

              {/* Institution Field (Read-Only / System Controlled) */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                  Sekolah / Instansi <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                    <Building className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    readOnly
                    tabIndex={-1}
                    aria-readonly="true"
                    value="SMKN 3 Jakarta"
                    onKeyDown={(e) => e.preventDefault()}
                    onPaste={(e) => e.preventDefault()}
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl bg-slate-100/80 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700/80 cursor-not-allowed select-none focus:outline-none focus:ring-0 focus:border-slate-200 dark:focus:border-slate-700/80 shadow-none"
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Sekolah ditentukan oleh sistem.
                </p>
              </div>

              {/* Department Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                  Jurusan / Program Keahlian
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Contoh: Rekayasa Perangkat Lunak"
                  className="w-full token-input px-3.5 py-2.5 text-sm"
                />
              </div>

              {/* NEW NOMOR WHATSAPP FIELD */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                  Nomor WhatsApp
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-600">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={handleWhatsappChange}
                    onBlur={() => validateWhatsApp(whatsapp)}
                    placeholder="Masukkan nomor WhatsApp (Contoh: 08123456789)"
                    className={`w-full token-input pl-10 pr-3.5 py-2.5 text-sm transition-all ${
                      whatsappError
                        ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-950"
                        : ""
                    }`}
                  />
                </div>
                {whatsappError && (
                  <p className="text-[11px] text-red-500 font-medium mt-1 animate-fadeIn">
                    {whatsappError}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] text-[var(--btn-secondary-text)] text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Kembali</span>
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-xl bg-[#1E3A8A] hover:bg-[#122353] text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Lanjut</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        )}

        {step === 3 && (
          /* STEP 3: PREFERENSI NOTIFIKASI (FIGMA DESIGN 1:1 MATCH) */
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Preferensi notifikasi
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed font-normal">
                Bisa diubah kapan saja di Pengaturan
              </p>
            </div>

            {/* NOTIFICATION PREFERENCES TOGGLE CARDS */}
            <div className="space-y-4 mb-8">
              {/* Option 1: Notifikasi email */}
              <div
                onClick={() => setEmailNotification(!emailNotification)}
                className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-4 cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                <div className="flex-1 pr-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                    Notifikasi email
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed font-normal">
                    Pemberitahuan penting seperti verifikasi jurnal dan absensi.
                  </p>
                </div>

                {/* TOGGLE SWITCH */}
                <div
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors shrink-0 flex items-center ${
                    emailNotification ? "bg-[#1E3A8A] dark:bg-blue-600 justify-end" : "bg-slate-300 dark:bg-slate-700 justify-start"
                  }`}
                >
                  <div className="w-5 h-5 rounded-full bg-white shadow-md transition-transform" />
                </div>
              </div>

              {/* Option 2: Ringkasan mingguan */}
              <div
                onClick={() => setWeeklyDigest(!weeklyDigest)}
                className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-4 cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                <div className="flex-1 pr-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                    Ringkasan mingguan
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed font-normal">
                    Rekap progres PKL setiap Senin pagi.
                  </p>
                </div>

                {/* TOGGLE SWITCH */}
                <div
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors shrink-0 flex items-center ${
                    weeklyDigest ? "bg-[#1E3A8A] dark:bg-blue-600 justify-end" : "bg-slate-300 dark:bg-slate-700 justify-start"
                  }`}
                >
                  <div className="w-5 h-5 rounded-full bg-white shadow-md transition-transform" />
                </div>
              </div>
            </div>

            {isFinished ? (
              <div className="p-4 rounded-xl bg-[var(--badge-success-bg)] border border-[var(--badge-success-border)] text-[var(--badge-success-text)] text-xs font-medium flex items-center gap-3 animate-fadeIn">
                <UserCheck className="w-5 h-5 shrink-0" />
                <span>Profil & preferensi berhasil disimpan! Mengalihkan ke dashboard...</span>
              </div>
            ) : (
              <div className="pt-2">
                {errorMsg && (
                  <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-medium border border-red-100 dark:border-red-900/30 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}
                <button
                  type="button"
                  disabled={isRegistering}
                  onClick={handleFinish}
                  className={`w-full py-3 px-4 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all text-sm font-semibold tracking-wide ${
                    isRegistering
                      ? "bg-slate-200 dark:bg-slate-800 text-slate-500 cursor-not-allowed"
                      : "bg-[#1E3A8A] hover:bg-[#122353] active:scale-[0.99] text-white cursor-pointer"
                  }`}
                >
                  {isRegistering ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Menyimpan Profil...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Selesai & Mulai Eksplorasi</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
