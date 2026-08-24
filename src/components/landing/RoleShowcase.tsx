"use client";

import { useState } from "react";
import {
  Shield,
  Users,
  Building2,
  GraduationCap,
  Eye,
  CalendarCheck,
  BookOpen,
  LayoutDashboard,
  Award,
  FileText,
  KanbanSquare,
  Bell,
  Settings,
  BarChart3,
} from "lucide-react";

interface RoleData {
  id: string;
  label: string;
  icon: React.ElementType;
  desc: string;
  features: { icon: React.ElementType; label: string }[];
  dashboardTitle: string;
  dashboardCards: { label: string; value: string }[];
}

const roles: RoleData[] = [
  {
    id: "admin",
    label: "Admin",
    icon: Shield,
    desc: "Kelola seluruh operasional PKL dari satu pusat. Akses penuh ke semua modul, data siswa, mitra DUDI, dan konfigurasi sistem.",
    features: [
      { icon: Users, label: "Manajemen Siswa" },
      { icon: Building2, label: "Manajemen DUDI" },
      { icon: CalendarCheck, label: "Absensi" },
      { icon: BookOpen, label: "Jurnal" },
      { icon: Award, label: "Evaluasi & Penilaian" },
      { icon: Settings, label: "Pengaturan Sistem" },
    ],
    dashboardTitle: "Dashboard Admin",
    dashboardCards: [
      { label: "Total Siswa", value: "48" },
      { label: "Mitra DUDI", value: "6" },
      { label: "Sedang Berjalan", value: "32" },
      { label: "Perlu Tindakan", value: "3" },
    ],
  },
  {
    id: "guru",
    label: "Guru Pembimbing",
    icon: Eye,
    desc: "Pantau dan evaluasi siswa bimbingan secara terstruktur. Verifikasi jurnal, pantau absensi, dan berikan penilaian.",
    features: [
      { icon: Users, label: "Siswa Bimbingan" },
      { icon: BookOpen, label: "Verifikasi Jurnal" },
      { icon: CalendarCheck, label: "Monitoring Absensi" },
      { icon: Award, label: "Penilaian" },
      { icon: Bell, label: "Notifikasi" },
    ],
    dashboardTitle: "Dashboard Guru Pembimbing",
    dashboardCards: [
      { label: "Siswa Bimbingan", value: "12" },
      { label: "Jurnal Pending", value: "5" },
      { label: "Absensi Hari Ini", value: "10" },
      { label: "Evaluasi Selesai", value: "7" },
    ],
  },
  {
    id: "industri",
    label: "Pembimbing Industri",
    icon: Building2,
    desc: "Pantau siswa magang di perusahaan Anda. Berikan feedback jurnal dan evaluasi performa siswa.",
    features: [
      { icon: Users, label: "Siswa Magang" },
      { icon: BookOpen, label: "Review Jurnal" },
      { icon: CalendarCheck, label: "Absensi Siswa" },
      { icon: Award, label: "Penilaian Industri" },
    ],
    dashboardTitle: "Dashboard Industri",
    dashboardCards: [
      { label: "Siswa Aktif", value: "8" },
      { label: "Jurnal Minggu Ini", value: "24" },
      { label: "Rata-rata Kehadiran", value: "94%" },
      { label: "Evaluasi Pending", value: "2" },
    ],
  },
  {
    id: "siswa",
    label: "Siswa",
    icon: GraduationCap,
    desc: "Fokus pada aktivitas PKL tanpa kehilangan arah. Isi absensi, tulis jurnal, dan pantau progress secara mandiri.",
    features: [
      { icon: CalendarCheck, label: "Absensi Harian" },
      { icon: BookOpen, label: "Jurnal PKL" },
      { icon: KanbanSquare, label: "Progress Tahapan" },
      { icon: FileText, label: "Sertifikat" },
    ],
    dashboardTitle: "Dashboard Siswa",
    dashboardCards: [
      { label: "Hari PKL", value: "45" },
      { label: "Jurnal Dikirim", value: "38" },
      { label: "Kehadiran", value: "96%" },
      { label: "Status", value: "Aktif" },
    ],
  },
  {
    id: "kepsek",
    label: "Kepala Sekolah",
    icon: BarChart3,
    desc: "Monitoring tingkat tinggi terhadap seluruh program PKL. Lihat ringkasan data dan progres angkatan.",
    features: [
      { icon: LayoutDashboard, label: "Ringkasan Eksekutif" },
      { icon: BarChart3, label: "Statistik Angkatan" },
      { icon: Users, label: "Data Siswa" },
      { icon: Building2, label: "Mitra DUDI" },
    ],
    dashboardTitle: "Dashboard Kepala Sekolah",
    dashboardCards: [
      { label: "Total Siswa", value: "48" },
      { label: "Tingkat Kelulusan", value: "97%" },
      { label: "Mitra Aktif", value: "6" },
      { label: "Progres PKL", value: "72%" },
    ],
  },
];

export default function RoleShowcase() {
  const [activeRole, setActiveRole] = useState(0);
  const role = roles[activeRole];

  return (
    <section id="peran" className="py-20 sm:py-28 bg-[var(--background)]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--foreground)] tracking-tight mb-4">
            Satu platform. Setiap peran punya pengalaman yang berbeda.
          </h2>
          <p className="text-base text-[var(--text-muted)] leading-relaxed">
            InternTrack menyesuaikan tampilan dan akses berdasarkan peran pengguna.
          </p>
        </div>

        {/* Role Tabs */}
        <div className="flex items-center justify-center mb-10 sm:mb-12">
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-[var(--surface-alt)] border border-[var(--card-border)] overflow-x-auto max-w-full custom-scrollbar">
            {roles.map((r, i) => {
              const Icon = r.icon;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setActiveRole(i)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    activeRole === i
                      ? "bg-[var(--btn-primary-bg)] text-white shadow-sm"
                      : "text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)]"
                  }`}
                  aria-pressed={activeRole === i}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{r.label}</span>
                  <span className="sm:hidden">{r.label.split(" ")[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Role Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left: Description & Features */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center">
                  <role.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-[var(--foreground)]">{role.label}</h3>
              </div>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">{role.desc}</p>
            </div>

            {/* Feature list */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3">Fitur yang tersedia</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {role.features.map((f) => {
                  const FIcon = f.icon;
                  return (
                    <div key={f.label} className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--card-border)]">
                      <FIcon className="w-4 h-4 text-[var(--brand-primary)] shrink-0" />
                      <span className="text-xs font-semibold text-[var(--foreground)]">{f.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Dashboard Preview */}
          <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-lg overflow-hidden">
            {/* Mini browser bar */}
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[var(--card-border)] bg-[var(--surface-alt)]">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <div className="w-2 h-2 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 text-center">
                <span className="text-[10px] font-medium text-[var(--text-muted)]">
                  interntrack.app/dashboard
                </span>
              </div>
            </div>

            <div className="p-4 sm:p-5 bg-[var(--background)]">
              {/* Title */}
              <div className="mb-4">
                <h4 className="text-sm font-bold text-[var(--foreground)]">{role.dashboardTitle}</h4>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Ringkasan data dan aktivitas.</p>
              </div>

              {/* Cards */}
              <div className="grid grid-cols-2 gap-2.5">
                {role.dashboardCards.map((card) => (
                  <div key={card.label} className="p-3 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)]">
                    <p className="text-[10px] font-semibold text-[var(--text-muted)] mb-1">{card.label}</p>
                    <p className="text-xl font-bold font-mono text-[var(--foreground)]">{card.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
