"use client";

import { useState, useRef, useEffect } from "react";
import { Sun, Moon, Monitor, ChevronDown } from "lucide-react";
import { useTheme } from "@/shared/hooks/useTheme";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export default function ThemeToggle({ className = "", showLabel = false }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef} suppressHydrationWarning>
      <div className="flex items-center gap-1 bg-[var(--surface-alt)] border border-[var(--card-border)] rounded-full p-1 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all">
        <button
          onClick={toggleTheme}
          type="button"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--surface)] transition-all cursor-pointer"
          title={`Tema: ${theme} (Klik untuk berganti)`}
          suppressHydrationWarning
        >
          {resolvedTheme === "dark" ? (
            <Moon className="w-4 h-4 text-blue-400 shrink-0" />
          ) : (
            <Sun className="w-4 h-4 text-amber-500 shrink-0" />
          )}
          {showLabel && (
            <span className="text-[11px] font-semibold text-[var(--foreground)]">
              {resolvedTheme === "dark" ? "Mode Gelap" : "Mode Terang"}
            </span>
          )}
        </button>

        <button
          onClick={() => setIsOpen(!isOpen)}
          type="button"
          className="p-1 rounded-full text-[var(--card-subtitle)] hover:text-[var(--foreground)] hover:bg-[var(--surface)] transition-all cursor-pointer"
          title="Pilih mode tema"
          suppressHydrationWarning
        >
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Dropdown Options */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-36 bg-[var(--dropdown-bg)] border border-[var(--dropdown-border)] rounded-2xl shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
          suppressHydrationWarning
        >
          <button
            onClick={() => {
              setTheme("light");
              setIsOpen(false);
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
              theme === "light"
                ? "bg-[var(--dropdown-item-hover)] text-amber-600 font-semibold"
                : "text-[var(--dropdown-text)] hover:bg-[var(--dropdown-item-hover)]"
            }`}
            suppressHydrationWarning
          >
            <Sun className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Terang</span>
          </button>

          <button
            onClick={() => {
              setTheme("dark");
              setIsOpen(false);
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
              theme === "dark"
                ? "bg-[var(--dropdown-item-hover)] text-blue-400 font-semibold"
                : "text-[var(--dropdown-text)] hover:bg-[var(--dropdown-item-hover)]"
            }`}
            suppressHydrationWarning
          >
            <Moon className="w-4 h-4 text-blue-400 shrink-0" />
            <span>Gelap</span>
          </button>

          <button
            onClick={() => {
              setTheme("system");
              setIsOpen(false);
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
              theme === "system"
                ? "bg-[var(--dropdown-item-hover)] text-blue-500 font-semibold"
                : "text-[var(--dropdown-text)] hover:bg-[var(--dropdown-item-hover)]"
            }`}
            suppressHydrationWarning
          >
            <Monitor className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Sistem</span>
          </button>
        </div>
      )}
    </div>
  );
}
