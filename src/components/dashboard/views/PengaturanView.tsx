"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Settings,
  User,
  Mail,
  MessageCircle,
  Building,
  GraduationCap,
  Save,
  Loader2,
} from "lucide-react";
import { useInternTrackStore } from "@/shared/store/useInternTrackStore";
import { getUserProfile, updateUserProfileDB } from "@/app/actions/user";

export default function PengaturanView() {
  const { addToast, userProfile, updateUserProfile } = useInternTrackStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Local form state
  const [fullName, setFullName] = useState("");
  const [fullNameError, setFullNameError] = useState("");

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const [whatsapp, setWhatsapp] = useState("");
  const [whatsappError, setWhatsappError] = useState("");

  const [institution, setInstitution] = useState("");
  const [department, setDepartment] = useState("");

  // Notifications
  const [emailNotif, setEmailNotif] = useState(true);
  const [weeklyNotif, setWeeklyNotif] = useState(false);

  // Helper to sanitize whatsapp value (convert "-" or undefined to "")
  const sanitizeWa = (val?: string | null) => {
    if (!val || val === "-") return "";
    return val;
  };

  // Populate form from data
  const populateForm = useCallback((data: {
    fullName: string;
    email: string;
    whatsapp?: string;
    institution?: string;
    department?: string;
    notificationEmail?: boolean;
    weeklySummary?: boolean;
  }) => {
    setFullName(data.fullName || "");
    setEmail(data.email || "");
    setWhatsapp(sanitizeWa(data.whatsapp));
    setInstitution(data.institution || "");
    setDepartment(data.department || "");
    setEmailNotif(data.notificationEmail ?? true);
    setWeeklyNotif(data.weeklySummary ?? false);
  }, []);

  // Fetch from database on mount to ensure source of truth
  useEffect(() => {
    let isSubscribed = true;

    async function loadFreshProfile() {
      setIsLoading(true);
      try {
        const res = await getUserProfile(userProfile?.email);
        if (isSubscribed && res.success && res.data) {
          populateForm(res.data);
          updateUserProfile(res.data);
        } else if (isSubscribed && userProfile) {
          populateForm(userProfile);
        }
      } catch (err) {
        if (isSubscribed && userProfile) {
          populateForm(userProfile);
        }
      } finally {
        if (isSubscribed) {
          setIsLoading(false);
        }
      }
    }

    loadFreshProfile();

    return () => {
      isSubscribed = false;
    };
  }, []); // Run once on mount

  const validateFullName = (val: string): boolean => {
    const trimmed = val.trim();
    if (!trimmed) {
      setFullNameError("Nama lengkap wajib diisi.");
      return false;
    }
    if (trimmed.length < 2) {
      setFullNameError("Nama lengkap minimal 2 karakter.");
      return false;
    }
    setFullNameError("");
    return true;
  };

  const validateEmail = (val: string): boolean => {
    const trimmed = val.trim();
    if (!trimmed) {
      setEmailError("Email akun wajib diisi.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setEmailError("Format email tidak valid.");
      return false;
    }
    setEmailError("");
    return true;
  };

  const validateWhatsApp = (val: string): boolean => {
    const trimmed = val.trim();
    if (!trimmed) {
      setWhatsappError("");
      return true;
    }
    // Supports 08..., +628..., 628... with 8 to 13 digits
    const waRegex = /^(?:\+62|62|0)8[1-9][0-9]{7,11}$/;
    if (!waRegex.test(trimmed)) {
      setWhatsappError(
        "Format nomor WhatsApp tidak valid. Contoh: 08123456789 atau +628123456789"
      );
      return false;
    }
    setWhatsappError("");
    return true;
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    const isNameValid = validateFullName(fullName);
    const isEmailValid = validateEmail(email);
    const isWaValid = validateWhatsApp(whatsapp);

    if (!isNameValid || !isEmailValid || !isWaValid) {
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        whatsapp: whatsapp.trim(),
        institution: institution.trim(),
        department: department.trim(),
        notificationEmail: emailNotif,
        weeklySummary: weeklyNotif,
      };

      const res = await updateUserProfileDB(userProfile?.email || email, payload);

      if (res.success && res.data) {
        // Update global Zustand store with source of truth data
        updateUserProfile(res.data);
        populateForm(res.data);

        addToast({
          type: "success",
          title: "Perubahan berhasil disimpan",
          message: "Data diri dan preferensi notifikasi Anda telah berhasil disimpan.",
        });
      } else {
        addToast({
          type: "error",
          title: "Gagal menyimpan perubahan",
          message: res.error || "Terjadi kesalahan saat menyimpan data. Silakan coba lagi.",
        });
      }
    } catch (error: any) {
      addToast({
        type: "error",
        title: "Gagal menyimpan perubahan",
        message: error?.message || "Terjadi kesalahan pada server. Silakan coba lagi.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
        <p className="text-xs text-[var(--card-subtitle)] font-medium">Memuat pengaturan...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* HEADER */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--card-title)] flex items-center gap-2">
          <Settings className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <span>Pengaturan & Data Diri</span>
        </h1>
        <p className="text-xs sm:text-sm text-[var(--card-subtitle)] mt-1">
          Kelola informasi profil akun, nomor kontak WhatsApp, dan preferensi notifikasi.
        </p>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* SECTION 1: DATA DIRI */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-[var(--card-shadow)] space-y-4">
          <h2 className="text-base font-bold text-[var(--card-title)] border-b border-[var(--card-border)] pb-3">
            Informasi Data Diri
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* NAMA LENGKAP */}
            <div>
              <label htmlFor="input-fullName" className="block font-semibold text-[var(--foreground)] mb-1.5">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 dark:text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="input-fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (fullNameError) validateFullName(e.target.value);
                  }}
                  onBlur={() => validateFullName(fullName)}
                  placeholder="Masukkan nama lengkap"
                  className={`w-full token-input pl-10 pr-3.5 py-2.5 ${
                    fullNameError ? "border-red-500 focus:border-red-500" : ""
                  }`}
                  aria-invalid={!!fullNameError}
                  aria-describedby={fullNameError ? "fullname-error" : undefined}
                />
              </div>
              {fullNameError && (
                <p id="fullname-error" className="text-[11px] text-red-500 font-medium mt-1">
                  {fullNameError}
                </p>
              )}
            </div>

            {/* EMAIL AKUN */}
            <div>
              <label htmlFor="input-email" className="block font-semibold text-[var(--foreground)] mb-1.5">
                Email Akun <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 dark:text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="input-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) validateEmail(e.target.value);
                  }}
                  onBlur={() => validateEmail(email)}
                  placeholder="contoh@smkn3.sch.id"
                  className={`w-full token-input pl-10 pr-3.5 py-2.5 ${
                    emailError ? "border-red-500 focus:border-red-500" : ""
                  }`}
                  aria-invalid={!!emailError}
                  aria-describedby={emailError ? "email-error" : undefined}
                />
              </div>
              {emailError && (
                <p id="email-error" className="text-[11px] text-red-500 font-medium mt-1">
                  {emailError}
                </p>
              )}
            </div>

            {/* NOMOR WHATSAPP */}
            <div>
              <label htmlFor="input-whatsapp" className="block font-semibold text-[var(--foreground)] mb-1.5">
                Nomor WhatsApp
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 dark:text-slate-400">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <input
                  id="input-whatsapp"
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => {
                    setWhatsapp(e.target.value);
                    if (whatsappError) validateWhatsApp(e.target.value);
                  }}
                  onBlur={() => validateWhatsApp(whatsapp)}
                  placeholder="Masukkan nomor WhatsApp (Contoh: 08123456789)"
                  className={`w-full token-input pl-10 pr-3.5 py-2.5 text-xs ${
                    whatsappError ? "border-red-500 focus:border-red-500" : ""
                  }`}
                  aria-invalid={!!whatsappError}
                  aria-describedby={whatsappError ? "whatsapp-error" : undefined}
                />
              </div>
              {whatsappError && (
                <p id="whatsapp-error" className="text-[11px] text-red-500 font-medium mt-1">
                  {whatsappError}
                </p>
              )}
            </div>

            {/* SEKOLAH / INSTANSI */}
            <div>
              <label htmlFor="input-institution" className="block font-semibold text-[var(--foreground)] mb-1.5">
                Sekolah / Instansi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 dark:text-slate-400">
                  <Building className="w-4 h-4" />
                </div>
                <input
                  id="input-institution"
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="Nama Sekolah atau Instansi"
                  className="w-full token-input pl-10 pr-3.5 py-2.5"
                />
              </div>
            </div>

            {/* JURUSAN / PROGRAM KEAHLIAN */}
            <div className="sm:col-span-2">
              <label htmlFor="input-department" className="block font-semibold text-[var(--foreground)] mb-1.5">
                Jurusan / Program Keahlian
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 dark:text-slate-400">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <input
                  id="input-department"
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Contoh: Rekayasa Perangkat Lunak"
                  className="w-full token-input pl-10 pr-3.5 py-2.5"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: PREFERENSI NOTIFIKASI */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-[var(--card-shadow)] space-y-4">
          <h2 className="text-base font-bold text-[var(--card-title)] border-b border-[var(--card-border)] pb-3">
            Preferensi Notifikasi
          </h2>

          <div className="space-y-3">
            {/* NOTIFIKASI EMAIL TOGGLE */}
            <div
              role="switch"
              aria-checked={emailNotif}
              aria-label="Toggle Notifikasi Email"
              tabIndex={0}
              onClick={() => setEmailNotif(!emailNotif)}
              onKeyDown={(e) => {
                if (e.key === " " || e.key === "Enter") {
                  e.preventDefault();
                  setEmailNotif(!emailNotif);
                }
              }}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-[var(--surface-alt)] flex items-center justify-between gap-4 cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <div>
                <h3 className="text-xs font-bold text-[var(--card-title)]">Notifikasi Email</h3>
                <p className="text-[11px] text-[var(--card-subtitle)] mt-0.5">
                  Pemberitahuan penting seperti verifikasi jurnal dan absensi.
                </p>
              </div>
              <div
                className={`w-11 h-6 rounded-full p-0.5 transition-colors shrink-0 flex items-center ${
                  emailNotif ? "bg-blue-600 justify-end" : "bg-slate-300 dark:bg-slate-700 justify-start"
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-white shadow-md transition-transform" />
              </div>
            </div>

            {/* RINGKASAN MINGGUAN TOGGLE */}
            <div
              role="switch"
              aria-checked={weeklyNotif}
              aria-label="Toggle Ringkasan Mingguan"
              tabIndex={0}
              onClick={() => setWeeklyNotif(!weeklyNotif)}
              onKeyDown={(e) => {
                if (e.key === " " || e.key === "Enter") {
                  e.preventDefault();
                  setWeeklyNotif(!weeklyNotif);
                }
              }}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-[var(--surface-alt)] flex items-center justify-between gap-4 cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <div>
                <h3 className="text-xs font-bold text-[var(--card-title)]">Ringkasan Mingguan</h3>
                <p className="text-[11px] text-[var(--card-subtitle)] mt-0.5">
                  Rekap progres PKL setiap Senin pagi.
                </p>
              </div>
              <div
                className={`w-11 h-6 rounded-full p-0.5 transition-colors shrink-0 flex items-center ${
                  weeklyNotif ? "bg-blue-600 justify-end" : "bg-slate-300 dark:bg-slate-700 justify-start"
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-white shadow-md transition-transform" />
              </div>
            </div>
          </div>
        </div>

        {/* SAVE BUTTON */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            aria-label="Simpan Perubahan"
            className={`py-3 px-6 rounded-xl bg-[#1E3A8A] hover:bg-[#122353] active:scale-[0.99] text-white text-xs font-semibold flex items-center gap-2 shadow-md transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isSaving ? "opacity-75 cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
