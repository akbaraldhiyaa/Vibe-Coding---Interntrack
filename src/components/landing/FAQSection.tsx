"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "Apa itu InternTrack?",
    a: "InternTrack adalah platform manajemen Praktik Kerja Lapangan (PKL) yang mengintegrasikan seluruh proses — mulai dari pendaftaran siswa, penempatan di mitra industri (DUDI), monitoring absensi dan jurnal harian, evaluasi, hingga penerbitan sertifikat — dalam satu sistem terpusat.",
  },
  {
    q: "Siapa yang dapat menggunakan InternTrack?",
    a: "InternTrack dirancang untuk seluruh pemangku kepentingan PKL: Admin sekolah, Guru Pembimbing, Pembimbing Industri, Siswa, dan Kepala Sekolah. Setiap peran memiliki akses dan tampilan yang disesuaikan.",
  },
  {
    q: "Apa saja yang bisa dikelola di InternTrack?",
    a: "Anda dapat mengelola data siswa dan mitra DUDI, mencatat absensi harian, menulis dan memverifikasi jurnal PKL, memantau tahapan PKL melalui Kanban, melakukan evaluasi dan penilaian, serta menerbitkan sertifikat — semuanya dalam satu platform.",
  },
  {
    q: "Apakah ada perbedaan akses antar peran?",
    a: "Ya. InternTrack menggunakan Role-Based Access Control (RBAC). Admin memiliki akses penuh, Guru Pembimbing fokus pada siswa bimbingannya, Siswa hanya melihat data pribadinya, dan Kepala Sekolah mendapatkan ringkasan eksekutif.",
  },
  {
    q: "Apakah data siswa dan absensi aman?",
    a: "Data dikelola dengan autentikasi terproteksi dan pembatasan akses berbasis peran. Setiap pengguna hanya dapat mengakses data yang relevan dengan perannya, dan halaman dashboard dilindungi oleh sistem autentikasi.",
  },
  {
    q: "Bagaimana proses PKL bekerja di InternTrack?",
    a: "Alur PKL mengikuti 6 tahap: Registrasi → Penempatan DUDI → Absensi & Jurnal → Monitoring & Review → Penilaian → Sertifikat. Setiap tahap dapat dipantau melalui tampilan Kanban dan dashboard ringkasan.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <section id="faq" className="py-20 sm:py-28 bg-[var(--background)]">
      <div className="max-w-[720px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--foreground)] tracking-tight mb-4">
            Pertanyaan Umum
          </h2>
          <p className="text-base text-[var(--text-muted)] leading-relaxed">
            Jawaban untuk pertanyaan yang sering diajukan tentang InternTrack.
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] overflow-hidden transition-all"
            >
              <button
                type="button"
                onClick={() => toggle(i)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggle(i);
                  }
                }}
                className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2 rounded-xl"
                aria-expanded={openIndex === i}
              >
                <span className="text-sm font-semibold text-[var(--foreground)] pr-4">{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-[var(--text-muted)] shrink-0 transition-transform duration-300 ${
                    openIndex === i ? "rotate-180" : ""
                  }`}
                />
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === i ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-5 pb-4">
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">{faq.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
