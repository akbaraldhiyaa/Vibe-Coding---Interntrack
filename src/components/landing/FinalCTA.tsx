"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function FinalCTA() {
  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg-brand-section)] via-[var(--bg-brand-section-subtle)] to-[var(--bg-brand-section)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.15),transparent_50%)]" />

      <div className="relative max-w-[720px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-4 leading-tight">
          Siap membuat proses PKL{" "}
          <br className="hidden sm:inline" />
          lebih terstruktur?
        </h2>

        <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-8 max-w-lg mx-auto">
          Satukan monitoring siswa, absensi, jurnal, penilaian, dan sertifikasi dalam satu platform.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-semibold text-[var(--bg-brand-section)] bg-white hover:bg-slate-100 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            Masuk ke InternTrack
            <ChevronRight className="w-4 h-4" />
          </Link>
          <a
            href="#fitur"
            onClick={(e) => {
              e.preventDefault();
              document.querySelector("#fitur")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-semibold text-slate-300 hover:text-white border border-slate-600 hover:border-slate-400 rounded-xl transition-all"
          >
            Lihat Demo
          </a>
        </div>
      </div>
    </section>
  );
}
