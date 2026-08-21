"use client";

import { useEffect, useState, useCallback } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import ToastContainer from "./ToastContainer";
import { useInternTrackStore } from "@/shared/store/useInternTrackStore";
import { fetchDashboardData } from "@/app/actions/init";

// View Components
import MainDashboardView from "./views/MainDashboardView";
import KanbanView from "./views/KanbanView";
import AbsensiView from "./views/AbsensiView";
import JurnalView from "./views/JurnalView";
import PenilaianView from "./views/PenilaianView";
import DataMasterView from "./views/DataMasterView";
import PengaturanView from "./views/PengaturanView";
import NotifikasiView from "./views/NotifikasiView"; // trigger rebuild

interface DashboardShellProps {
  onLogout?: () => void;
}

export default function DashboardShell({ onLogout }: DashboardShellProps) {
  const { currentRoute, initData, userProfile, addToast } = useInternTrackStore();
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoadError(null);
    try {
      const res = await fetchDashboardData(userProfile?.email);
      if (res.success && res.data) {
        initData(res.data);
      } else {
        const errMsg = res.error || "Gagal memuat data dari database.";
        setLoadError(errMsg);
        addToast({
          type: "error",
          title: "Gagal Memuat Data",
          message: errMsg,
        });
      }
    } catch (err: any) {
      const errMsg = err?.message || "Terjadi kesalahan saat memuat data.";
      setLoadError(errMsg);
      addToast({
        type: "error",
        title: "Koneksi Bermasalah",
        message: errMsg,
      });
    } finally {
      setIsDataLoaded(true);
    }
  }, [initData, userProfile?.email, addToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const renderActiveView = () => {
    switch (currentRoute) {
      case "dashboard":
        return <MainDashboardView />;
      case "kanban":
        return <KanbanView />;
      case "absensi":
        return <AbsensiView />;
      case "jurnal":
        return <JurnalView />;
      case "penilaian":
        return <PenilaianView />;
      case "master-data":
        return <DataMasterView />;
      case "notifikasi":
        return <NotifikasiView />;
      case "pengaturan":
        return <PengaturanView />;
      default:
        return <MainDashboardView />;
    }
  };

  if (!isDataLoaded) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <p className="text-xs text-[var(--card-subtitle)] font-medium">Memuat data...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-lg text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--foreground)]">Data Gagal Dimuat</h3>
            <p className="text-xs text-[var(--card-subtitle)] mt-1">{loadError}</p>
          </div>
          <button
            onClick={() => {
              setIsDataLoaded(false);
              loadData();
            }}
            type="button"
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-2 mx-auto cursor-pointer transition shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Coba Lagi</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full bg-[var(--background)] text-[var(--foreground)] flex transition-colors duration-300"
      suppressHydrationWarning
    >
      {/* Sidebar */}
      <Sidebar />

      {/* Main Layout Container (Navbar + Content) */}
      <div className="flex-1 flex flex-col min-w-0" suppressHydrationWarning>
        <Navbar onLogout={onLogout} />

        {/* Dynamic Route Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8" suppressHydrationWarning>
          {renderActiveView()}
        </main>
      </div>

      {/* Global Toast Manager */}
      <ToastContainer />
    </div>
  );
}
