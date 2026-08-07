"use client";

import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import ToastContainer from "./ToastContainer";
import { useInternTrackStore } from "@/shared/store/useInternTrackStore";

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
  const { currentRoute } = useInternTrackStore();

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
