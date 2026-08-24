"use client";

import Link from "next/link";
import {
  Users,
  Building2,
  BookCheck,
  Briefcase,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  ChevronRight,
} from "lucide-react";

/* ─── Static sanitized mock data for dashboard preview ─── */
const mockCards = [
  {
    label: "Total Siswa PKL",
    value: "48",
    sub: "100% Terdaftar",
    icon: Users,
    subIcon: ArrowUpRight,
  },
  {
    label: "Sedang Berjalan",
    value: "32",
    sub: "Aktif di 6 Perusahaan",
    icon: Building2,
    subIcon: CheckCircle2,
  },
  {
    label: "Jurnal Menunggu Review",
    value: "7",
    sub: "Perlu Verifikasi",
    icon: BookCheck,
    subIcon: Clock,
  },
  {
    label: "Total Mitra DUDI",
    value: "6",
    sub: "DUDI Terdaftar Aktif",
    icon: Briefcase,
    subIcon: Building2,
  },
];

const mockStudents = [
  { name: "Ahmad Rizki", nisn: "0051234567", kelas: "XII RPL 1", dept: "Rekayasa Perangkat Lunak", dudi: "PT Maju Sejahtera", stage: "Pelaksanaan (DUDI)", att: 96, status: "Aktif" },
  { name: "Siti Nurhaliza", nisn: "0051234568", kelas: "XII MM 2", dept: "Multimedia", dudi: "CV Kreatif Digital", stage: "Pelaksanaan (DUDI)", att: 92, status: "Aktif" },
  { name: "Budi Santoso", nisn: "0051234569", kelas: "XII TKJ 1", dept: "Teknik Komputer", dudi: "PT Infratech", stage: "Penilaian & Review", att: 88, status: "Aktif" },
  { name: "Dewi Anggraini", nisn: "0051234570", kelas: "XII RPL 2", dept: "Rekayasa Perangkat Lunak", dudi: "PT Solusi Data", stage: "Pelaksanaan (DUDI)", att: 98, status: "Aktif" },
];

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
}

export default function HeroSection() {
  return (
    <section id="beranda" className="relative pt-24 sm:pt-32 pb-14 sm:pb-24 overflow-hidden scroll-mt-20">
      {/* Subtle gradient backdrop */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-[var(--bg-brand-primary)] via-transparent to-transparent opacity-40 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Text content */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          {/* Eyebrow */}
          <div className="landing-animate is-visible inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
            Platform Manajemen PKL
          </div>

          {/* Headline */}
          <h1 className="landing-animate landing-animate-delay-1 is-visible text-3xl sm:text-5xl lg:text-[60px] font-extrabold text-[var(--foreground)] leading-[1.15] tracking-tight mb-5">
            Kelola PKL.
            <br />
            <span className="text-[var(--brand-primary)]">Lebih Terstruktur.</span>{" "}
            <span className="text-[var(--text-muted)]">Lebih Terukur.</span>
          </h1>

          {/* Subtitle */}
          <p className="landing-animate landing-animate-delay-2 is-visible text-sm sm:text-lg text-[var(--text-muted)] leading-relaxed max-w-2xl mx-auto mb-8">
            InternTrack menyatukan siswa, pembimbing, industri, absensi, jurnal, penilaian, dan sertifikat dalam satu platform terintegrasi.
          </p>

          {/* CTAs */}
          <div className="landing-animate landing-animate-delay-3 is-visible flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[var(--btn-primary-bg)] hover:bg-[var(--btn-primary-hover)] rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              Masuk ke Dashboard
              <ChevronRight className="w-4 h-4" />
            </Link>
            <a
              href="#fitur"
              onClick={(e) => {
                e.preventDefault();
                document.querySelector("#fitur")?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-[var(--text-secondary)] border border-[var(--card-border)] bg-[var(--surface)] hover:bg-[var(--surface-alt)] rounded-xl transition-all cursor-pointer"
            >
              Lihat Fitur
            </a>
          </div>
        </div>

        {/* Product Showcase — Dashboard Preview */}
        <div className="landing-scale-in is-visible relative mx-auto max-w-[1100px]">
          {/* Glow effect */}
          <div className="absolute -inset-4 bg-gradient-to-t from-[var(--brand-primary)] to-transparent opacity-[0.07] rounded-3xl blur-2xl pointer-events-none" />

          {/* Browser Frame */}
          <div className="relative rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-2xl overflow-hidden">
            {/* Browser bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--card-border)] bg-[var(--surface-alt)]">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 flex items-center justify-center">
                <div className="px-4 py-1 rounded-lg bg-[var(--background)] border border-[var(--card-border)] text-[11px] font-medium text-[var(--text-muted)] max-w-xs w-full text-center truncate">
                  interntrack.app/dashboard
                </div>
              </div>
              <div className="w-16 hidden sm:block" />
            </div>

            {/* Dashboard content */}
            <div className="p-4 sm:p-6 bg-[var(--background)]">
              {/* Page header */}
              <div className="mb-5">
                <h2 className="text-base sm:text-lg font-semibold text-[var(--foreground)]">Dashboard</h2>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">Ringkasan pelaksanaan PKL hari ini.</p>
              </div>

              {/* Summary cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 mb-5">
                {mockCards.map((card) => {
                  const Icon = card.icon;
                  const SubIcon = card.subIcon;
                  return (
                    <div
                      key={card.label}
                      className="p-3 sm:p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xs"
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-[10px] sm:text-xs font-semibold text-[var(--text-secondary)] leading-tight">{card.label}</span>
                        <Icon className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0 hidden sm:block" />
                      </div>
                      <div className="mt-2">
                        <p className="text-lg sm:text-2xl font-bold text-[var(--foreground)] font-mono">{card.value}</p>
                        <p className="text-[9px] sm:text-[11px] text-[var(--text-muted)] font-semibold mt-0.5 flex items-center gap-1">
                          <SubIcon className="w-3 h-3 shrink-0" />
                          <span className="truncate">{card.sub}</span>
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Student preview for mobile screens */}
              <div className="sm:hidden space-y-2 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-3">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--card-border)]">
                  <h3 className="text-xs font-bold text-[var(--foreground)]">Daftar Siswa & Penempatan</h3>
                  <span className="text-[10px] font-semibold text-[var(--brand-primary)]">Ringkasan</span>
                </div>
                {mockStudents.slice(0, 2).map((s) => (
                  <div key={s.nisn} className="flex items-center justify-between py-1.5 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-full bg-slate-900 dark:bg-slate-700 text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                        {getInitials(s.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-[var(--foreground)] text-[11px] truncate">{s.name}</p>
                        <p className="text-[10px] text-[var(--brand-primary)] truncate">{s.dudi}</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 shrink-0">
                      {s.att}%
                    </span>
                  </div>
                ))}
              </div>

              {/* Student table (tablet & desktop) */}
              <div className="hidden sm:block rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] overflow-hidden">
                <div className="px-4 py-3 border-b border-[var(--card-border)]">
                  <h3 className="text-sm font-bold text-[var(--foreground)]">Daftar Siswa & Penempatan</h3>
                </div>
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[var(--card-border)] bg-[var(--surface-alt)] text-[var(--text-muted)] font-semibold">
                      <th className="py-2.5 px-4">Nama Siswa</th>
                      <th className="py-2.5 px-4 hidden lg:table-cell">Kelas</th>
                      <th className="py-2.5 px-4">Perusahaan DUDI</th>
                      <th className="py-2.5 px-4 hidden lg:table-cell">Tahapan</th>
                      <th className="py-2.5 px-4">Presensi</th>
                      <th className="py-2.5 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--card-border)]">
                    {mockStudents.map((s) => (
                      <tr key={s.nisn} className="text-[var(--foreground)]">
                        <td className="py-2.5 px-4 font-bold flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-900 dark:bg-slate-700 text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                            {getInitials(s.name)}
                          </div>
                          <span className="truncate">{s.name}</span>
                        </td>
                        <td className="py-2.5 px-4 text-[var(--text-muted)] hidden lg:table-cell">{s.kelas}</td>
                        <td className="py-2.5 px-4 font-semibold text-[var(--brand-primary)]">{s.dudi}</td>
                        <td className="py-2.5 px-4 text-[var(--text-muted)] hidden lg:table-cell">{s.stage}</td>
                        <td className="py-2.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${s.att >= 90 ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300" : "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300"}`}>
                            {s.att}%
                          </span>
                        </td>
                        <td className="py-2.5 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--badge-success-bg)] text-[var(--badge-success-text)] border border-[var(--badge-success-border)]">
                            {s.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
