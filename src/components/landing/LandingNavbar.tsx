"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { GraduationCap, Menu, X } from "lucide-react";

import ThemeToggle from "@/components/ThemeToggle";

const navLinks = [
  { label: "Beranda", href: "#beranda" },
  { label: "Fitur", href: "#fitur" },
  { label: "Alur PKL", href: "#alur" },
  { label: "Peran", href: "#peran" },
  { label: "FAQ", href: "#faq" },
];

export default function LandingNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsOpen(false);
    const el = document.querySelector(href);
    if (el) {
      const offset = 80;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[var(--header-bg)] backdrop-blur-xl border-b border-[var(--header-border)] shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-[var(--btn-primary-bg)] flex items-center justify-center shadow-xs">
              <GraduationCap className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-base font-bold text-[var(--foreground)] tracking-tight">
              InternTrack
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="px-3.5 py-2 text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--foreground)] rounded-lg hover:bg-[var(--surface-alt)] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTAs & Theme Toggle */}
          <div className="hidden md:flex items-center gap-2.5">
            <ThemeToggle />
            <a
              href="#fitur"
              onClick={(e) => handleNavClick(e, "#fitur")}
              className="px-3.5 py-2 text-[13px] font-semibold text-[var(--text-secondary)] hover:text-[var(--foreground)] border border-[var(--card-border)] rounded-xl hover:bg-[var(--surface-alt)] transition-all cursor-pointer"
            >
              Lihat Demo
            </a>
            <Link
              href="/login"
              className="px-4 py-2 text-[13px] font-semibold text-white bg-[var(--btn-primary-bg)] hover:bg-[var(--btn-primary-hover)] rounded-xl transition-all shadow-sm"
            >
              Masuk ke Dashboard
            </Link>
          </div>

          {/* Mobile Right Controls (Theme + Hamburger) */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-[var(--foreground)] hover:bg-[var(--surface-alt)] transition-colors cursor-pointer"
              aria-label={isOpen ? "Tutup menu" : "Buka menu"}
              aria-expanded={isOpen}
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-[var(--background)] z-40 border-t border-[var(--card-border)] overflow-y-auto">
          <div className="flex flex-col p-6 gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="px-4 py-3 text-[15px] font-medium text-[var(--text-secondary)] hover:text-[var(--foreground)] rounded-xl hover:bg-[var(--surface-alt)] transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-4 pt-4 border-t border-[var(--card-border)] flex flex-col gap-2.5">
              <a
                href="#fitur"
                onClick={(e) => handleNavClick(e, "#fitur")}
                className="px-4 py-3 text-[15px] font-semibold text-[var(--text-secondary)] text-center border border-[var(--card-border)] rounded-xl hover:bg-[var(--surface-alt)] transition-all"
              >
                Lihat Demo
              </a>
              <Link
                href="/login"
                className="px-4 py-3 text-[15px] font-semibold text-white bg-[var(--btn-primary-bg)] hover:bg-[var(--btn-primary-hover)] rounded-xl transition-all text-center shadow-sm"
                onClick={() => setIsOpen(false)}
              >
                Masuk ke Dashboard
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
