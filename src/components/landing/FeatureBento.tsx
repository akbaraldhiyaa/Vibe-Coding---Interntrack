"use client";

import {
  CalendarCheck,
  BookOpen,
  Users,
  KanbanSquare,
  Award,
  FileText,
  Bell,
  LayoutDashboard,
} from "lucide-react";

const features = [
  {
    title: "Absensi",
    desc: "Pantau kehadiran harian siswa dengan status real-time — hadir, terlambat, izin, sakit, atau tidak hadir.",
    icon: CalendarCheck,
    size: "large" as const,
    visual: () => (
      <div className="mt-4 space-y-2">
        {[
          { name: "Ahmad R.", status: "Hadir", time: "07:15", color: "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300" },
          { name: "Siti N.", status: "Hadir", time: "07:22", color: "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300" },
          { name: "Budi S.", status: "Terlambat", time: "08:05", color: "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300" },
        ].map((row) => (
          <div key={row.name} className="flex items-center justify-between px-3 py-2 rounded-lg bg-[var(--background)] border border-[var(--card-border)]">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-slate-800 dark:bg-slate-700 text-white text-[9px] font-bold flex items-center justify-center">
                {row.name.split(" ").map(n => n[0]).join("")}
              </div>
              <span className="text-xs font-semibold text-[var(--foreground)]">{row.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[var(--text-muted)] font-mono">{row.time}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${row.color}`}>
                {row.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: "Jurnal Harian",
    desc: "Siswa menulis aktivitas harian. Pembimbing memverifikasi dan memberi feedback.",
    icon: BookOpen,
    size: "medium" as const,
    visual: () => (
      <div className="mt-4 space-y-2">
        {[
          { date: "21 Agt", title: "Setup development environment", status: "Disetujui" },
          { date: "20 Agt", title: "Belajar REST API fundamentals", status: "Menunggu" },
        ].map((j) => (
          <div key={j.date} className="px-3 py-2 rounded-lg bg-[var(--background)] border border-[var(--card-border)]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono text-[var(--text-muted)]">{j.date}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${j.status === "Disetujui" ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300" : "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300"}`}>
                {j.status}
              </span>
            </div>
            <p className="text-xs font-semibold text-[var(--foreground)] truncate">{j.title}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: "Kanban PKL",
    desc: "Visualisasi tahapan PKL dari pendaftaran hingga sertifikasi.",
    icon: KanbanSquare,
    size: "medium" as const,
    visual: () => (
      <div className="mt-4 flex gap-2 overflow-hidden">
        {[
          { name: "Pendaftaran", count: 8, color: "bg-blue-500" },
          { name: "Pelaksanaan", count: 32, color: "bg-[var(--brand-primary)]" },
          { name: "Penilaian", count: 5, color: "bg-amber-500" },
          { name: "Selesai", count: 3, color: "bg-emerald-500" },
        ].map((col) => (
          <div key={col.name} className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className={`w-2 h-2 rounded-full ${col.color}`} />
              <span className="text-[10px] font-semibold text-[var(--text-muted)] truncate">{col.name}</span>
            </div>
            <div className="text-lg font-bold font-mono text-[var(--foreground)]">{col.count}</div>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: "Penilaian & Evaluasi",
    desc: "Skor teknis, non-teknis, dan nilai akhir dengan grading otomatis.",
    icon: Award,
    size: "large" as const,
    visual: () => (
      <div className="mt-4 space-y-2.5">
        {[
          { label: "Teknis", score: 88, color: "bg-[var(--brand-primary)]" },
          { label: "Non-Teknis", score: 92, color: "bg-blue-500" },
          { label: "Nilai Akhir", score: 90, color: "bg-emerald-500" },
        ].map((item) => (
          <div key={item.label}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium text-[var(--text-muted)]">{item.label}</span>
              <span className="font-bold font-mono text-[var(--foreground)]">{item.score}</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[var(--surface-alt)] overflow-hidden">
              <div className={`h-full rounded-full ${item.color} transition-all duration-500`} style={{ width: `${item.score}%` }} />
            </div>
          </div>
        ))}
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 mt-2">
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Grade</span>
          <span className="text-lg font-bold font-mono text-emerald-700 dark:text-emerald-300">A</span>
        </div>
      </div>
    ),
  },
  {
    title: "Sertifikat",
    desc: "Generate sertifikat PKL setelah evaluasi selesai.",
    icon: FileText,
    size: "small" as const,
    visual: null,
  },
  {
    title: "Data Master",
    desc: "Kelola data siswa dan mitra DUDI secara terpusat.",
    icon: Users,
    size: "small" as const,
    visual: null,
  },
  {
    title: "Notifikasi",
    desc: "Pemberitahuan real-time untuk jurnal, absensi, dan tugas.",
    icon: Bell,
    size: "small" as const,
    visual: null,
  },
  {
    title: "Dashboard",
    desc: "Ringkasan lengkap monitoring PKL dalam satu tampilan.",
    icon: LayoutDashboard,
    size: "small" as const,
    visual: null,
  },
];

export default function FeatureBento() {
  return (
    <section id="fitur" className="py-20 sm:py-28 bg-[var(--background)]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--foreground)] tracking-tight mb-4">
            Satu platform untuk seluruh proses PKL.
          </h2>
          <p className="text-base text-[var(--text-muted)] leading-relaxed">
            Dari penempatan hingga sertifikasi, semua aktivitas terhubung dalam satu alur kerja.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feat) => {
            const Icon = feat.icon;
            const gridClass =
              feat.size === "large"
                ? "md:col-span-2 lg:col-span-2"
                : feat.size === "medium"
                ? "md:col-span-2 lg:col-span-2"
                : "col-span-1";

            return (
              <div
                key={feat.title}
                className={`${gridClass} p-5 sm:p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xs hover:shadow-md hover:border-[var(--border-brand)] transition-all duration-300 group`}
              >
                <div className="flex items-start gap-3 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center shrink-0 group-hover:bg-[var(--brand-primary)] transition-colors duration-300">
                    <Icon className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[var(--foreground)]">{feat.title}</h3>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5 leading-relaxed">{feat.desc}</p>
                  </div>
                </div>
                {feat.visual && feat.visual()}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
