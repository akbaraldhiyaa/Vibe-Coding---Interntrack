"use client";

import { useState } from "react";
import {
  Settings,
  User,
  Mail,
  MessageCircle,
  Building,
  CheckCircle2,
  Save,
} from "lucide-react";
import { useInternTrackStore } from "@/shared/store/useInternTrackStore";

export default function PengaturanView() {
  const { addToast } = useInternTrackStore();

  const [fullName, setFullName] = useState("Akbar Kurnia");
  const [email, setEmail] = useState("akbar.kurnia@smkn3.sch.id");
  const [whatsapp, setWhatsapp] = useState("081234567890");
  const [whatsappError, setWhatsappError] = useState("");
  const [institution, setInstitution] = useState("SMKN 3 Jakarta");
  const [department, setDepartment] = useState("Rekayasa Perangkat Lunak");

  // Notifications
  const [emailNotif, setEmailNotif] = useState(true);
  const [weeklyNotif, setWeeklyNotif] = useState(false);

  const validateWhatsApp = (val: string): boolean => {
    const trimmed = val.trim();
    if (!trimmed) {
      setWhatsappError("");
      return true;
    }
    const waRegex = /^(?:\+62|62|0)8[1-9][0-9]{7,11}$/;
    if (!waRegex.test(trimmed)) {
      setWhatsappError("Format nomor WhatsApp tidak valid. Contoh: 08123456789 atau +628123456789");
      return false;
    }
    setWhatsappError("");
    return true;
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (whatsapp && !validateWhatsApp(whatsapp)) {
      return;
    }

    addToast({
      type: "success",
      title: "Profil Disimpan",
      message: "Perubahan data diri dan preferensi Anda telah berhasil diperbarui.",
    });
  };

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
            <div>
              <label className="block font-semibold text-[var(--foreground)] mb-1.5">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-600">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full token-input pl-10 pr-3.5 py-2.5"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[var(--foreground)] mb-1.5">
                Email Akun <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-600">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full token-input pl-10 pr-3.5 py-2.5"
                />
              </div>
            </div>

            {/* NOMOR WHATSAPP FIELD */}
            <div>
              <label className="block font-semibold text-[var(--foreground)] mb-1.5">
                Nomor WhatsApp
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-600">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <input
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
                />
              </div>
              {whatsappError && (
                <p className="text-[11px] text-red-500 font-medium mt-1">{whatsappError}</p>
              )}
            </div>

            <div>
              <label className="block font-semibold text-[var(--foreground)] mb-1.5">
                Sekolah / Instansi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-600">
                  <Building className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="w-full token-input pl-10 pr-3.5 py-2.5"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-[var(--foreground)] mb-1.5">
                Jurusan / Program Keahlian
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full token-input px-3.5 py-2.5"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: PREFERENSI NOTIFIKASI */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-[var(--card-shadow)] space-y-4">
          <h2 className="text-base font-bold text-[var(--card-title)] border-b border-[var(--card-border)] pb-3">
            Preferensi Notifikasi
          </h2>

          <div className="space-y-3">
            <div
              onClick={() => setEmailNotif(!emailNotif)}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-[var(--surface-alt)] flex items-center justify-between gap-4 cursor-pointer"
            >
              <div>
                <h4 className="text-xs font-bold text-[var(--card-title)]">Notifikasi Email</h4>
                <p className="text-[11px] text-[var(--card-subtitle)] mt-0.5">
                  Pemberitahuan penting seperti verifikasi jurnal dan absensi.
                </p>
              </div>
              <div
                className={`w-11 h-6 rounded-full p-0.5 transition-colors shrink-0 flex items-center ${
                  emailNotif ? "bg-blue-600 justify-end" : "bg-slate-300 dark:bg-slate-700 justify-start"
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-white shadow-md" />
              </div>
            </div>

            <div
              onClick={() => setWeeklyNotif(!weeklyNotif)}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-[var(--surface-alt)] flex items-center justify-between gap-4 cursor-pointer"
            >
              <div>
                <h4 className="text-xs font-bold text-[var(--card-title)]">Ringkasan Mingguan</h4>
                <p className="text-[11px] text-[var(--card-subtitle)] mt-0.5">
                  Rekap progres PKL setiap Senin pagi.
                </p>
              </div>
              <div
                className={`w-11 h-6 rounded-full p-0.5 transition-colors shrink-0 flex items-center ${
                  weeklyNotif ? "bg-blue-600 justify-end" : "bg-slate-300 dark:bg-slate-700 justify-start"
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-white shadow-md" />
              </div>
            </div>
          </div>
        </div>

        {/* SAVE BUTTON */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="py-3 px-6 rounded-xl bg-[#1E3A8A] hover:bg-[#122353] active:scale-[0.99] text-white text-xs font-semibold flex items-center gap-2 shadow-md cursor-pointer transition"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Perubahan</span>
          </button>
        </div>
      </form>
    </div>
  );
}
