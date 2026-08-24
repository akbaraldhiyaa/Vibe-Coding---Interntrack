"use client";

import { Users, LayoutGrid, Link2, ArrowRight } from "lucide-react";

const stats = [
  { value: "5", label: "Role Utama", icon: Users },
  { value: "6+", label: "Modul Inti", icon: LayoutGrid },
  { value: "1", label: "Platform Terintegrasi", icon: Link2 },
  { value: "E2E", label: "Alur PKL Lengkap", icon: ArrowRight },
];

export default function StatsStrip() {
  return (
    <section className="relative border-y border-[var(--card-border)] bg-[var(--surface)]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="flex items-center gap-3 sm:gap-4"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center shrink-0">
                  <Icon className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold font-mono text-[var(--foreground)] leading-none">
                    {stat.value}
                  </p>
                  <p className="text-[11px] sm:text-xs font-medium text-[var(--text-muted)] mt-0.5">
                    {stat.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
