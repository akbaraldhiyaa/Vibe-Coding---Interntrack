"use client";

import { useState, useRef, useEffect } from "react";
import {
  Search,
  Bell,
  User,
  LogOut,
  ChevronDown,
  Menu,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { useInternTrackStore, Role } from "@/shared/store/useInternTrackStore";
import ThemeToggle from "../ThemeToggle";

interface NavbarProps {
  onLogout?: () => void;
}

export default function Navbar({ onLogout }: NavbarProps) {
  const {
    currentRole,
    setRole,
    searchQuery,
    setSearchQuery,
    toggleSidebar,
    attendanceRecords,
    setRoute,
  } = useInternTrackStore();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const rolesList: Role[] = [
    "Admin",
    "Guru Pembimbing",
    "Pembimbing Industri",
    "Siswa",
    "Kepala Sekolah",
  ];

  // Count unread items (anomalies/terlambat)
  const anomaliesCount = attendanceRecords.filter((a) => a.status === "Anomali" || a.status === "Terlambat").length;
  const totalUnread = anomaliesCount > 0 ? anomaliesCount : 1;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) {
        setIsRoleDropdownOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full h-16 bg-[var(--header-bg)] border-b border-[var(--header-border)] backdrop-blur-md transition-colors duration-200">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left: Sidebar Toggle Only (brand lives in sidebar) */}
        <div className="flex items-center gap-3" suppressHydrationWarning>
          <button
            onClick={toggleSidebar}
            type="button"
            className="p-2 rounded-xl text-[var(--foreground)] hover:bg-[var(--surface-alt)] transition cursor-pointer"
            title="Toggle Sidebar"
            suppressHydrationWarning
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-md hidden md:block" suppressHydrationWarning>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--input-placeholder)]">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari siswa, DUDI, jurnal, atau presensi..."
              className="w-full token-input pl-10 pr-3.5 py-1.5 text-xs sm:text-sm bg-[var(--surface-alt)] border-[var(--card-border)]"
              suppressHydrationWarning
            />
          </div>
        </div>

        {/* Right: Actions (Role Switcher, Notifications, Theme, Profile) */}
        <div className="flex items-center gap-2 sm:gap-3" suppressHydrationWarning>
          {/* Role Switcher Pill Dropdown */}
          <div className="relative" ref={roleRef} suppressHydrationWarning>
            <button
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              type="button"
              className="px-3 py-1.5 rounded-full bg-[var(--surface-alt)] border border-[var(--card-border)] text-xs font-semibold text-[var(--foreground)] hover:border-slate-400 transition flex items-center gap-1.5"
              title="Beralih Peran Demonstrasi"
              suppressHydrationWarning
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span className="hidden lg:inline">{currentRole}</span>
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>

            {isRoleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-[var(--dropdown-bg)] border border-[var(--dropdown-border)] rounded-2xl shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3.5 py-1.5 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                  Simulasi Peran
                </div>
                {rolesList.map((role) => (
                  <button
                    key={role}
                    onClick={() => {
                      setRole(role);
                      setIsRoleDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-medium transition-colors ${
                      currentRole === role
                        ? "bg-[var(--dropdown-item-hover)] text-blue-600 font-semibold"
                        : "text-[var(--dropdown-text)] hover:bg-[var(--dropdown-item-hover)]"
                    }`}
                  >
                    <span>{role}</span>
                    {currentRole === role && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef} suppressHydrationWarning>
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              type="button"
              className="relative p-2 rounded-full text-[var(--foreground)] hover:bg-[var(--surface-alt)] transition"
              title="Notifikasi"
              suppressHydrationWarning
            >
              <Bell className="w-4 h-4" />
              {totalUnread > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {totalUnread}
                </span>
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-[var(--dropdown-bg)] border border-[var(--dropdown-border)] rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--card-border)] mb-3">
                  <h3 className="text-xs font-bold text-[var(--card-title)]">Notifikasi In-App</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold">
                    {totalUnread} Baru
                  </span>
                </div>

                <div className="space-y-2.5 max-h-64 overflow-y-auto">
                  {anomaliesCount > 0 && (
                    <div
                      onClick={() => {
                        setRoute("absensi");
                        setIsNotificationsOpen(false);
                      }}
                      className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5 cursor-pointer hover:opacity-90"
                    >
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-xs">{anomaliesCount} Presensi Anomali</p>
                        <p className="text-[11px] opacity-80 mt-0.5">Memerlukan koreksi jam/lokasi dari pembimbing.</p>
                      </div>
                    </div>
                  )}


                  {/* Journal notifications can be re-enabled when integrated */}

                  {totalUnread === 0 && (
                    <p className="text-xs text-slate-600 text-center py-4 font-normal">
                      Tidak ada notifikasi baru.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle Button in Header */}
          <div className="flex items-center" suppressHydrationWarning>
            <ThemeToggle showLabel />
          </div>

          {/* User Profile Dropdown */}
          <div className="relative" ref={userRef} suppressHydrationWarning>
            <button
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              type="button"
              className="flex items-center gap-2 p-1 rounded-full hover:bg-[var(--surface-alt)] transition cursor-pointer"
              suppressHydrationWarning
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs" suppressHydrationWarning>
                AK
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {isUserDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-[var(--dropdown-bg)] border border-[var(--dropdown-border)] rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2 border-b border-[var(--card-border)] mb-1">
                  <p className="text-xs font-bold text-[var(--card-title)]">Akbar Kurnia</p>
                  <p className="text-[11px] text-[var(--card-subtitle)]">{currentRole}</p>
                </div>

                <button
                  onClick={() => {
                    setRoute("pengaturan");
                    setIsUserDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-[var(--dropdown-text)] hover:bg-[var(--dropdown-item-hover)] font-medium transition cursor-pointer"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Pengaturan Profil</span>
                </button>

                <div className="my-1 border-t border-[var(--card-border)]" />

                <button
                  onClick={() => {
                    setIsUserDropdownOpen(false);
                    if (onLogout) onLogout();
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 font-semibold transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar dari Akun</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
