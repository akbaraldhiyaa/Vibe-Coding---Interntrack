"use client";

import { Shield, Route, Lock, LayoutDashboard } from "lucide-react";

const points = [
  {
    icon: Shield,
    title: "Role-Based Access",
    desc: "Setiap pengguna hanya melihat fitur dan data sesuai perannya — Admin, Guru, Industri, Siswa, atau Kepala Sekolah.",
  },
  {
    icon: Route,
    title: "Protected Routes",
    desc: "Halaman dashboard dilindungi oleh autentikasi. Hanya pengguna yang terverifikasi dapat mengakses sistem.",
  },
  {
    icon: Lock,
    title: "Data Ownership",
    desc: "Data siswa, jurnal, dan absensi dibatasi sesuai hak akses. Siswa hanya melihat data miliknya sendiri.",
  },
  {
    icon: LayoutDashboard,
    title: "Centralized Management",
    desc: "Seluruh alur PKL — dari pendaftaran hingga sertifikasi — berada di satu sistem yang terkoordinasi.",
  },
];

export default function TrustSection() {
  return (
    <section className="py-20 sm:py-28 bg-[var(--surface)]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--foreground)] tracking-tight mb-4">
            Dibangun dengan akses yang terstruktur.
          </h2>
          <p className="text-base text-[var(--text-muted)] leading-relaxed">
            Kontrol akses berlapis memastikan setiap pengguna mendapatkan pengalaman yang sesuai dan aman.
          </p>
        </div>

        {/* Trust Points Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {points.map((point) => {
            const Icon = point.icon;
            return (
              <div
                key={point.title}
                className="p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-[var(--border-brand)] transition-all duration-300 shadow-xs hover:shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[var(--foreground)] mb-1.5">{point.title}</h3>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">{point.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
