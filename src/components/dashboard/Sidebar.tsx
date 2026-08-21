"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  GraduationCap,
  LayoutDashboard,
  QrCode,
  BookOpen,
  Award,
  Bell,
  Settings,
  LogOut,
  X,
  KanbanSquare,
} from "lucide-react";
import { useInternTrackStore } from "@/shared/store/useInternTrackStore";

interface SidebarProps {
  onLogout?: () => void;
}

/** Breakpoint below which we treat viewport as "mobile" */
const MOBILE_BREAKPOINT = 768;

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return isMobile;
}

export default function Sidebar({ onLogout }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    isSidebarOpen,
    closeSidebar,
    currentRole,
    notifications,
    userProfile,
  } = useInternTrackStore();

  const [isMounted, setIsMounted] = useState(false);
  const isMobile = useIsMobile();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const hamburgerReturnRef = useRef<HTMLElement | null>(null);

  useEffect(() => setIsMounted(true), []);

  // --- Mobile: close sidebar on initial render so it starts closed ---
  useEffect(() => {
    if (isMounted && isMobile && isSidebarOpen) {
      closeSidebar();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted, isMobile]);

  const notifCount = notifications.filter((n) => !n.isRead).length;

  // --- Navigate & auto-close on mobile ---
  const handleNavigate = useCallback(
    (href: string) => {
      router.push(href);
      if (isMobile) {
        closeSidebar();
      }
    },
    [router, isMobile, closeSidebar]
  );

  // --- ESC key to close ---
  useEffect(() => {
    if (!isMobile || !isSidebarOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeSidebar();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMobile, isSidebarOpen, closeSidebar]);

  // --- Body scroll lock on mobile ---
  useEffect(() => {
    if (!isMobile) return;

    if (isSidebarOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.overflow = "hidden";

      return () => {
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.left = "";
        document.body.style.right = "";
        document.body.style.overflow = "";
        window.scrollTo(0, scrollY);
      };
    }
  }, [isMobile, isSidebarOpen]);

  // --- Focus management: focus close button when sidebar opens on mobile ---
  useEffect(() => {
    if (isMobile && isSidebarOpen && closeButtonRef.current) {
      hamburgerReturnRef.current = document.activeElement as HTMLElement;
      closeButtonRef.current.focus();
    }
  }, [isMobile, isSidebarOpen]);

  // Return focus to hamburger on close
  const handleClose = useCallback(() => {
    closeSidebar();
    setTimeout(() => {
      if (hamburgerReturnRef.current && typeof hamburgerReturnRef.current.focus === "function") {
        hamburgerReturnRef.current.focus();
      }
    }, 0);
  }, [closeSidebar]);

  const navigationItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      roles: ["Admin", "Guru Pembimbing", "Pembimbing Industri", "Siswa", "Kepala Sekolah"],
    },
    {
      href: "/dashboard/kanban",
      label: "Kanban Tahapan",
      icon: KanbanSquare,
      roles: ["Admin", "Guru Pembimbing", "Pembimbing Industri", "Siswa", "Kepala Sekolah"],
    },
    {
      href: "/dashboard/absensi",
      label: "Absensi",
      icon: QrCode,
      roles: ["Admin", "Guru Pembimbing", "Pembimbing Industri", "Siswa", "Kepala Sekolah"],
    },
    {
      href: "/dashboard/jurnal",
      label: "Jurnal Harian",
      icon: BookOpen,
      roles: ["Admin", "Guru Pembimbing", "Pembimbing Industri", "Siswa", "Kepala Sekolah"],
    },
    {
      href: "/dashboard/penilaian",
      label: "Laporan & Sertifikat",
      icon: Award,
      roles: ["Admin", "Guru Pembimbing", "Pembimbing Industri", "Siswa", "Kepala Sekolah"],
    },
  ];

  const getUserInitials = () => {
    if (!isMounted) return "";
    return userProfile.fullName ? userProfile.fullName.substring(0, 2).toUpperCase() : "US";
  };

  const getUserName = () => {
    if (!isMounted) return "";
    return userProfile.fullName || "Pengguna";
  };

  // --- Desktop: hide when not open ---
  if (!isMobile && !isSidebarOpen) return null;

  const isNotifActive = pathname === "/dashboard/notifikasi";
  const isPengaturanActive = pathname === "/dashboard/pengaturan";

  const sidebarContent = (
    <div className="space-y-6">
      {/* BRAND HEADER */}
      <div className="flex items-center justify-between">
        <div
          className="flex items-center gap-3 px-1 cursor-pointer"
          onClick={() => handleNavigate("/dashboard")}
        >
          <div className="w-9 h-9 rounded-full bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center shadow-xs shrink-0">
            <GraduationCap className="w-5 h-5 text-slate-100" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-[var(--foreground)] leading-tight tracking-tight">
              InternTrack
            </h1>
            <p className="text-[11px] text-[var(--card-subtitle)] font-medium">SMKN 3 Jakarta</p>
          </div>
        </div>

        {/* Close button — visible only on mobile */}
        {isMobile && (
          <button
            ref={closeButtonRef}
            onClick={handleClose}
            type="button"
            className="p-2 rounded-xl text-[var(--foreground)] hover:bg-[var(--surface-alt)] transition cursor-pointer md:hidden"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        )}
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
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <button
                  key={item.href}
                  onClick={() => handleNavigate(item.href)}
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
            onClick={() => handleNavigate("/dashboard/notifikasi")}
            type="button"
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              isNotifActive
                ? "bg-[#0C1838] dark:bg-blue-600 text-white shadow-xs"
                : "text-[var(--sidebar-text)] hover:bg-[var(--surface-alt)] hover:text-[var(--foreground)]"
            }`}
          >
            <div className="flex items-center gap-3">
              <Bell className={`w-4 h-4 shrink-0 ${isNotifActive ? "text-white" : "text-slate-500 dark:text-slate-400"}`} />
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
  );

  const sidebarBottom = (
    <div className="pt-4 border-t border-[var(--sidebar-border)] space-y-2">
      <button
        onClick={() => handleNavigate("/dashboard/pengaturan")}
        type="button"
        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
          isPengaturanActive
            ? "bg-[#0C1838] dark:bg-blue-600 text-white shadow-xs"
            : "text-[var(--sidebar-text)] hover:bg-[var(--surface-alt)] hover:text-[var(--foreground)]"
        }`}
      >
        <Settings className={`w-4 h-4 ${isPengaturanActive ? "text-white" : "text-slate-500 dark:text-slate-400"}`} />
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
  );

  // ========== MOBILE DRAWER ==========
  if (isMobile) {
    return (
      <>
        {/* Overlay / Backdrop */}
        <div
          className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${
            isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={handleClose}
          aria-hidden="true"
        />

        {/* Sidebar Drawer */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex flex-col justify-between p-5 bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-border)] shadow-2xl overflow-y-auto transition-transform duration-300 ease-in-out ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          style={{ width: "85vw", maxWidth: "320px" }}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          suppressHydrationWarning
        >
          {sidebarContent}
          {sidebarBottom}
        </aside>
      </>
    );
  }

  // ========== DESKTOP SIDEBAR ==========
  return (
    <aside
      className="w-64 bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-border)] flex flex-col justify-between p-5 shrink-0 transition-all duration-200 sticky top-0 h-screen overflow-y-auto"
      suppressHydrationWarning
    >
      {sidebarContent}
      {sidebarBottom}
    </aside>
  );
}
