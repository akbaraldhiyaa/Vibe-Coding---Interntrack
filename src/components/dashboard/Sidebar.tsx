"use client";

import {
  GraduationCap,
  LayoutDashboard,
  QrCode,
  BookOpen,
  Award,
  Bell,
  Settings,
  LogOut,
} from "lucide-react";
import { useInternTrackStore, RoutePath } from "@/shared/store/useInternTrackStore";

interface SidebarProps {
  onLogout?: () => void;
}

export default function Sidebar({ onLogout }: SidebarProps) {
  const {
    currentRoute,
    setRoute,
    isSidebarOpen,
    currentRole,
    notifications,
  } = useInternTrackStore();

  const notifCount = notifications.filter((n) => !n.isRead).length;

  const navigationItems = [
    {
      id: "dashboard" as RoutePath,
      label: "Dashboard",
      icon: LayoutDashboard,
      roles: ["Admin", "Guru Pembimbing", "Pembimbing Industri", "Siswa", "Kepala Sekolah"],
    },
    {
      id: "absensi" as RoutePath,
      label: "Absensi",
      icon: QrCode,
      roles: ["Admin", "Guru Pembimbing", "Pembimbing Industri", "Siswa", "Kepala Sekolah"],
    },
    {
      id: "jurnal" as RoutePath,
      label: "Jurnal Harian",
      icon: BookOpen,
      roles: ["Admin", "Guru Pembimbing", "Pembimbing Industri", "Siswa", "Kepala Sekolah"],
    },
    {
      id: "penilaian" as RoutePath,
      label: "Laporan & Sertifikat",
      icon: Award,
      roles: ["Admin", "Guru Pembimbing", "Pembimbing Industri", "Siswa", "Kepala Sekolah"],
    },
  ];

  // Derive initials from the role's display name
  const getUserInitials = () => {
    if (currentRole === "Admin") return "AK";
    if (currentRole === "Siswa") return "MD";
    return currentRole.substring(0, 2).toUpperCase();
  };

  const getUserName = () => {
    if (currentRole === "Admin") return "Akbar Kurnia";
    if (currentRole === "Siswa") return "Muhammad D...";
    return currentRole;
  };

  if (!isSidebarOpen) return null;

  return (
    <aside
      className="w-64 bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-border)] flex flex-col justify-between p-5 shrink-0 transition-all duration-200 absolute inset-y-0 left-0 z-50 md:relative md:sticky md:top-0 h-screen overflow-y-auto shadow-2xl md:shadow-none"
      suppressHydrationWarning
    >
      <div className="space-y-6">
        {/* BRAND HEADER — single source of InternTrack identity */}
        <div className="flex items-center gap-3 px-1">
          <div
            className="w-9 h-9 rounded-full bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center shadow-xs shrink-0 cursor-pointer"
            onClick={() => setRoute("dashboard")}
          >
            <GraduationCap className="w-5 h-5 text-slate-100" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-[var(--foreground)] leading-tight tracking-tight">
              InternTrack
            </h1>
            <p className="text-[11px] text-[var(--card-subtitle)] font-medium">SMKN 3 Jakarta</p>
          </div>
        </div>

        {/* NAVIGATION: RUANG KERJA */}
        <div>
          <p className="px-3 text-[10px] font-bold text-slate-600 dark:text-slate-500 uppercase tracking-widest mb-3">
            RUANG KERJA
          </p>

          <nav className="space-y-1">
            {navigationItems
              .filter((item) => item.roles.includes(currentRole))
              .map((item) => {
                const Icon = item.icon;
                const isActive = currentRoute === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setRoute(item.id)}
                    type="button"
                    suppressHydrationWarning
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#0C1838] dark:bg-blue-600 text-white shadow-xs"
                        : "text-[var(--sidebar-text)] hover:bg-[var(--surface-alt)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-500 dark:text-slate-400"}`} />
                      <span>{item.label}</span>
                    </div>
                  </button>
                );
              })}

            {/* Notifikasi */}
            <button
              onClick={() => setRoute("notifikasi")}
              type="button"
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                currentRoute === "notifikasi"
                  ? "bg-[#0C1838] dark:bg-blue-600 text-white shadow-xs"
                  : "text-[var(--sidebar-text)] hover:bg-[var(--surface-alt)] hover:text-[var(--foreground)]"
              }`}
            >
              <div className="flex items-center gap-3">
                <Bell className={`w-4 h-4 shrink-0 ${currentRoute === "notifikasi" ? "text-white" : "text-slate-500 dark:text-slate-400"}`} />
                <span>Notifikasi</span>
              </div>
              {notifCount > 0 && (
                <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {notifCount}
                </span>
              )}
            </button>
          </nav>
        </div>
      </div>

      {/* BOTTOM: Settings + Profile (uses currentRole from store for consistency) */}
      <div className="pt-4 border-t border-[var(--sidebar-border)] space-y-2">
        <button
          onClick={() => setRoute("pengaturan")}
          type="button"
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
            currentRoute === "pengaturan"
              ? "bg-[#0C1838] dark:bg-blue-600 text-white shadow-xs"
              : "text-[var(--sidebar-text)] hover:bg-[var(--surface-alt)] hover:text-[var(--foreground)]"
          }`}
        >
          <Settings className={`w-4 h-4 ${currentRoute === "pengaturan" ? "text-white" : "text-slate-500 dark:text-slate-400"}`} />
          <span>Pengaturan</span>
        </button>

        <div className="w-full p-2.5 rounded-2xl border border-[var(--card-border)] bg-[var(--surface-alt)] flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0" suppressHydrationWarning>
              {getUserInitials()}
            </div>
            <div className="text-left truncate">
              <p className="text-xs font-bold truncate leading-tight text-[var(--foreground)]">{getUserName()}</p>
              <p className="text-[10px] text-[var(--card-subtitle)] truncate font-medium">{currentRole}</p>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onLogout) onLogout();
            }}
            type="button"
            className="p-1.5 rounded-lg text-slate-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer"
            title="Keluar"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
