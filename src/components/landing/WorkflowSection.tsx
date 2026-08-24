"use client";

import {
  UserPlus,
  Building2,
  CalendarCheck,
  Eye,
  Award,
  FileText,
} from "lucide-react";

const steps = [
  {
    num: "01",
    title: "Registrasi",
    desc: "Data siswa dan pembimbing didaftarkan ke dalam sistem.",
    icon: UserPlus,
  },
  {
    num: "02",
    title: "Penempatan DUDI",
    desc: "Siswa ditempatkan ke mitra industri sesuai kuota dan jurusan.",
    icon: Building2,
  },
  {
    num: "03",
    title: "Absensi & Jurnal",
    desc: "Monitoring kehadiran harian dan dokumentasi aktivitas PKL.",
    icon: CalendarCheck,
  },
  {
    num: "04",
    title: "Monitoring & Review",
    desc: "Pembimbing memantau progres dan memberikan feedback.",
    icon: Eye,
  },
  {
    num: "05",
    title: "Penilaian",
    desc: "Evaluasi teknis dan non-teknis dengan grading otomatis.",
    icon: Award,
  },
  {
    num: "06",
    title: "Sertifikat",
    desc: "Generate sertifikat PKL setelah proses evaluasi selesai.",
    icon: FileText,
  },
];

export default function WorkflowSection() {
  return (
    <section id="alur" className="py-20 sm:py-28 bg-[var(--surface)]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--foreground)] tracking-tight mb-4">
            Dari penempatan hingga sertifikasi.
          </h2>
          <p className="text-base text-[var(--text-muted)] leading-relaxed">
            Alur PKL end-to-end yang terstruktur dan terpantau di setiap tahap.
          </p>
        </div>

        {/* Desktop horizontal timeline */}
        <div className="hidden lg:block">
          <div className="relative">
            {/* Connector line */}
            <div className="absolute top-[28px] left-[60px] right-[60px] h-[2px] bg-[var(--card-border)]" />

            <div className="grid grid-cols-6 gap-4">
              {steps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={step.num} className="relative flex flex-col items-center text-center">
                    {/* Number badge */}
                    <div className="relative z-10 w-14 h-14 rounded-2xl bg-[var(--card-bg)] border-2 border-[var(--card-border)] flex items-center justify-center mb-4 shadow-sm hover:border-[var(--brand-primary)] hover:shadow-md transition-all duration-300 group">
                      <Icon className="w-6 h-6 text-[var(--text-muted)] group-hover:text-[var(--brand-primary)] transition-colors" />
                    </div>

                    {/* Step number */}
                    <span className="text-[10px] font-bold font-mono text-[var(--brand-primary)] mb-1 tracking-wider">
                      STEP {step.num}
                    </span>

                    {/* Title */}
                    <h3 className="text-sm font-bold text-[var(--foreground)] mb-1.5">
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile/Tablet vertical timeline */}
        <div className="lg:hidden">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute top-0 bottom-0 left-[27px] w-[2px] bg-[var(--card-border)]" />

            <div className="space-y-8">
              {steps.map((step) => {
                const Icon = step.icon;
                return (
                  <div key={step.num} className="relative flex items-start gap-5">
                    {/* Circle */}
                    <div className="relative z-10 w-14 h-14 rounded-2xl bg-[var(--card-bg)] border-2 border-[var(--card-border)] flex items-center justify-center shrink-0 shadow-sm">
                      <Icon className="w-6 h-6 text-[var(--brand-primary)]" />
                    </div>

                    {/* Content */}
                    <div className="pt-1">
                      <span className="text-[10px] font-bold font-mono text-[var(--brand-primary)] tracking-wider">
                        STEP {step.num}
                      </span>
                      <h3 className="text-sm font-bold text-[var(--foreground)] mt-0.5 mb-1">
                        {step.title}
                      </h3>
                      <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
