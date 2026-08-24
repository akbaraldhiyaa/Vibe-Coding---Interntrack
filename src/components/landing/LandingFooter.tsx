"use client";

import Link from "next/link";
import { GraduationCap } from "lucide-react";

const footerLinks = {
  Fitur: [
    { label: "Absensi", href: "#fitur" },
    { label: "Jurnal", href: "#fitur" },
    { label: "Penilaian", href: "#fitur" },
    { label: "Kanban", href: "#fitur" },
  ],
  Platform: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Alur PKL", href: "#alur" },
    { label: "Peran Pengguna", href: "#peran" },
    { label: "FAQ", href: "#faq" },
  ],
  Akun: [
    { label: "Masuk", href: "/login" },
    { label: "Dashboard", href: "/dashboard" },
  ],
};

export default function LandingFooter() {
  return (
    <footer className="border-t border-[var(--card-border)] bg-[var(--surface)]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--btn-primary-bg)] flex items-center justify-center">
                <GraduationCap className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="text-base font-bold text-[var(--foreground)] tracking-tight">InternTrack</span>
            </div>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed max-w-xs">
              Platform Manajemen PKL terintegrasi untuk sekolah dan institusi pendidikan.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith("/") ? (
                      <Link
                        href={link.href}
                        className="text-xs text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        onClick={(e) => {
                          e.preventDefault();
                          document.querySelector(link.href)?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="text-xs text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-[var(--card-border)] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[var(--text-muted)]">
            © 2026 InternTrack. Platform Manajemen PKL.
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            Dibangun untuk pendidikan Indonesia.
          </p>
        </div>
      </div>
    </footer>
  );
}
