"use client";

import { useState, useRef } from "react";
import {
  Users,
  Building2,
  BookCheck,
  AlertTriangle,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  Clock,
  ChevronRight,
  Sparkles,
  Bell,
  Search,
  X,
  ArrowRight,
  Briefcase,
  PlayCircle,
  CheckCircle,
  AlertCircle,
  BookOpen,
  ChevronUp,
  ChevronDown,
  CheckSquare,
  Square,
  Inbox,
  ChevronsUpDown
} from "lucide-react";
import { useInternTrackStore, Student } from "@/shared/store/useInternTrackStore";
import ThemeToggle from "@/components/ThemeToggle";
import { StatusBadge } from "@/components/ui/StatusBadge";

export default function MainDashboardView() {
  const {
    students,
    dudiList,
    attendanceRecords,
    journals,
    searchQuery,
    setSearchQuery,
    setRoute,
    currentRole,
  } = useInternTrackStore();

  const [statusFilter, setStatusFilter] = useState<string>("Semua");
  const [selectedStudentModal, setSelectedStudentModal] = useState<Student | null>(null);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [activityTab, setActivityTab] = useState<"Semua" | "Jurnal" | "Absensi">("Semua");
  const [sortConfig, setSortConfig] = useState<{ key: "name" | "attendance" | "stage" | null, direction: "asc" | "desc" | null }>({ key: null, direction: null });
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipData, setTooltipData] = useState<{ show: boolean, data: { name: string, count: number, percent: string } | null, isKeyboard: boolean }>({ show: false, data: null, isKeyboard: false });

  const handleChartMouseMove = (e: React.MouseEvent) => {
    if (tooltipRef.current && !tooltipData.isKeyboard) {
      tooltipRef.current.style.left = `${e.clientX + 15}px`;
      tooltipRef.current.style.top = `${e.clientY + 15}px`;
    }
  };

  // 1. Data Metric Calculation (Strict Consistency with Summary Cards & Charts)
  const totalStudents = students.length; // 11
  const activeCount = students.filter((s) => s.status === "Aktif").length; // 6
  const pembekalanCount = students.filter((s) => s.status === "Pembekalan").length; // 3
  const completedCount = students.filter((s) => s.status === "Selesai").length; // 1
  const issueCount = students.filter((s) => s.status === "Bermasalah").length; // 1

  const activeDudiCount = dudiList.length;
  const pendingJournalsCount = journals.filter((j) => j.status === "Menunggu verifikasi").length;
  const attentionStudents = students.filter((s) => s.status === "Bermasalah" || s.attendanceRate < 85);

  // Filtered Students for Table (Max 5 on Dashboard Overview)
  const filteredStudents = students
    .filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.nisn.includes(searchQuery) ||
        s.dudiName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "Semua" || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (!sortConfig.key || !sortConfig.direction) return 0;
      let comparison = 0;
      if (sortConfig.key === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortConfig.key === "attendance") {
        comparison = a.attendanceRate - b.attendanceRate;
      } else if (sortConfig.key === "stage") {
        comparison = a.stage.localeCompare(b.stage);
      }
      return sortConfig.direction === "asc" ? comparison : -comparison;
    })
    .slice(0, 5);

  // TODO: If the table data comes from a paginated API in the future, sort only the currently visible page.
  const handleSort = (key: "name" | "attendance" | "stage") => {
    let newDirection: "asc" | "desc" | null = null;
    if (sortConfig.key === key) {
      if (sortConfig.direction === "asc") newDirection = "desc";
      else if (sortConfig.direction === "desc") newDirection = null;
      else newDirection = "asc";
    } else {
      if (key === "attendance") newDirection = "desc";
      else newDirection = "asc";
    }
    setSortConfig({ key: newDirection ? key : null, direction: newDirection });
  };

  const SortIcon = ({ column }: { column: "name" | "attendance" | "stage" }) => {
    if (sortConfig.key !== column) {
      return <ChevronsUpDown size={14} className="text-gray-400" />;
    }
    return sortConfig.direction === "asc" ? (
      <ChevronUp size={14} className="text-blue-500" />
    ) : (
      <ChevronDown size={14} className="text-blue-500" />
    );
  };

  // Activity Feed combining Recent Journals & Attendance (Max 6 activities)
  const activityFeed = [
    {
      id: "act-1",
      date: "05 Agu 2026",
      studentName: "Dita Ariyanti",
      type: "Jurnal",
      description: "Menyusun UI komponen dashboard InternTrack",
      status: "Terverifikasi",
    },
    {
      id: "act-2",
      date: "05 Agu 2026",
      studentName: "Fitri Handayani",
      type: "Jurnal",
      description: "Dokumentasi foto aktivitas & laporan visual",
      status: "Menunggu Review",
    },
    {
      id: "act-3",
      date: "04 Agu 2026",
      studentName: "Galih Pramudito",
      type: "Jurnal",
      description: "Konfigurasi jaringan LAN kantor Telkom",
      status: "Terverifikasi",
    },
    {
      id: "act-4",
      date: "04 Agu 2026",
      studentName: "Eko Wibowo",
      type: "Jurnal",
      description: "Perawatan perangkat komputer bimbingan",
      status: "Terverifikasi",
    },
    {
      id: "act-5",
      date: "05 Agu 2026",
      studentName: "Dita Ariyanti",
      type: "Absensi",
      description: "Hadir - Masuk 08:02 (Scan QR DUDI)",
      status: "Hadir",
    },
    {
      id: "act-6",
      date: "05 Agu 2026",
      studentName: "Galih Pramudito",
      type: "Absensi",
      description: "Hadir - Masuk 08:04 (Scan QR DUDI)",
      status: "Hadir",
    },
  ];

  // Helper for Student Initial Avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Page Header (H1) */}
      <div>
        <h1 className="text-[24px] font-semibold text-[var(--text-primary)]">Dashboard</h1>
        <p className="text-xs text-[var(--text-muted)] mt-1">Ringkasan pelaksanaan PKL hari ini.</p>
      </div>

      {/* ==========================================
          BAGIAN 1: EMPAT (4) SUMMARY CARDS UTAMA
         ========================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Siswa PKL */}
        <div
          onClick={() => setRoute("master-data")}
          className="p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-[var(--card-shadow)] flex flex-col justify-between cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition"
        >
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-[var(--text-secondary)]">Total Siswa PKL</span>
            <Users className="w-4 h-4 text-[var(--text-muted)]" />
          </div>
          <div className="mt-3">
            <h2 className="text-3xl font-bold text-[var(--text-primary)] font-mono">{totalStudents}</h2>
            <p className="text-[11px] text-gray-600 dark:text-gray-400 font-semibold mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              <span>100% Terdaftar</span>
            </p>
          </div>
        </div>

        {/* Card 2: Sedang Berjalan */}
        <div
          onClick={() => setRoute("kanban")}
          className="p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-[var(--card-shadow)] flex flex-col justify-between cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition"
        >
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-[var(--text-secondary)]">Sedang Berjalan</span>
            <Building2 className="w-4 h-4 text-[var(--text-muted)]" />
          </div>
          <div className="mt-3">
            <h2 className="text-3xl font-bold text-[var(--text-primary)] font-mono">{activeCount}</h2>
            <p className="text-[11px] text-gray-600 dark:text-gray-400 font-semibold mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Aktif di {activeDudiCount} Perusahaan</span>
            </p>
          </div>
        </div>

        {/* Card 3: Jurnal Menunggu Review */}
        <div
          onClick={() => setRoute("jurnal")}
          className="p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-[var(--card-shadow)] flex flex-col justify-between cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition"
        >
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-[var(--text-secondary)]">Jurnal Menunggu Review</span>
            <BookCheck className="w-4 h-4 text-[var(--text-muted)]" />
          </div>
          <div className="mt-3">
            <h2 className="text-3xl font-bold text-[var(--text-primary)] font-mono">{pendingJournalsCount}</h2>
            <p className="text-[11px] text-gray-600 dark:text-gray-400 font-semibold mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Perlu Verifikasi</span>
            </p>
          </div>
        </div>

        {/* Card 4: Total Mitra DUDI */}
        <div
          onClick={() => setRoute("master-data")}
          className="p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-[var(--card-shadow)] flex flex-col justify-between cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition"
        >
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-[var(--text-secondary)]">Total Mitra DUDI</span>
            <Briefcase className="w-4 h-4 text-[var(--text-muted)]" />
          </div>
          <div className="mt-3">
            <h2 className="text-3xl font-bold text-[var(--text-primary)] font-mono">{activeDudiCount}</h2>
            <p className="text-[11px] text-gray-600 dark:text-gray-400 font-semibold mt-1 flex items-center gap-1">
              <Building2 className="w-3 h-3" />
              <span>DUDI Terdaftar Aktif</span>
            </p>
          </div>
        </div>
      </div>

      {/* ==========================================
          BAGIAN 3: DUA (2) MAIN COLUMNS
          (DISTRIBUSI STATUS & PANEL BUTUH PERHATIAN)
         ========================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column (2 Cols): Distribusi Status Penempatan */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-[var(--card-shadow)] flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest block mb-1">
              DISTRIBUSI STATUS PENEMPATAN
            </span>
            <h3 className="text-base font-bold text-[var(--card-title)] mb-6">Status siswa</h3>

            {/* Donut Chart & Legend Row */}
            <div className="flex flex-col sm:flex-row items-center gap-8 justify-around mb-6">
              {/* SVG Donut Chart */}
              <div className="relative w-40 h-40 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  {/* Background Track Circle */}
                  <circle cx="18" cy="18" r="15.9155" fill="none" stroke="var(--surface-alt)" strokeWidth="3.5" />
                  
                  {/* Segment 1: Aktif (Blue - 6/11 = 54.5%) */}
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9155"
                    fill="none"
                    stroke="#1E3A8A"
                    strokeWidth="3.5"
                    strokeDasharray="54.5, 100"
                    strokeDashoffset="0"
                    tabIndex={0}
                    className="focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] cursor-pointer"
                    onMouseEnter={(e) => {
                      setTooltipData({ show: true, data: { name: 'Aktif', count: activeCount, percent: '54.5' }, isKeyboard: false });
                      if (tooltipRef.current) {
                        tooltipRef.current.style.left = `${e.clientX + 15}px`;
                        tooltipRef.current.style.top = `${e.clientY + 15}px`;
                      }
                    }}
                    onMouseMove={handleChartMouseMove}
                    onMouseLeave={() => setTooltipData(prev => ({ ...prev, show: false }))}
                    onFocus={() => setTooltipData({ show: true, data: { name: 'Aktif', count: activeCount, percent: '54.5' }, isKeyboard: true })}
                    onBlur={() => setTooltipData(prev => ({ ...prev, show: false }))}
                    aria-describedby="chart-tooltip"
                  >
                    <title>{`Aktif: ${activeCount} siswa (54.5%)`}</title>
                  </circle>
                  {/* Segment 2: Pembekalan (Amber - 3/11 = 27.2%) */}
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9155"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="3.5"
                    strokeDasharray="27.2, 100"
                    strokeDashoffset="-54.5"
                    tabIndex={0}
                    className="focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                    onMouseEnter={(e) => {
                      setTooltipData({ show: true, data: { name: 'Pembekalan', count: pembekalanCount, percent: '27.2' }, isKeyboard: false });
                      if (tooltipRef.current) {
                        tooltipRef.current.style.left = `${e.clientX + 15}px`;
                        tooltipRef.current.style.top = `${e.clientY + 15}px`;
                      }
                    }}
                    onMouseMove={handleChartMouseMove}
                    onMouseLeave={() => setTooltipData(prev => ({ ...prev, show: false }))}
                    onFocus={() => setTooltipData({ show: true, data: { name: 'Pembekalan', count: pembekalanCount, percent: '27.2' }, isKeyboard: true })}
                    onBlur={() => setTooltipData(prev => ({ ...prev, show: false }))}
                    aria-describedby="chart-tooltip"
                  >
                    <title>{`Pembekalan: ${pembekalanCount} siswa (27.2%)`}</title>
                  </circle>
                  {/* Segment 3: Selesai (Emerald - 1/11 = 9.1%) */}
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9155"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="3.5"
                    strokeDasharray="9.1, 100"
                    strokeDashoffset="-81.7"
                    tabIndex={0}
                    className="focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    onMouseEnter={(e) => {
                      setTooltipData({ show: true, data: { name: 'Selesai', count: completedCount, percent: '9.1' }, isKeyboard: false });
                      if (tooltipRef.current) {
                        tooltipRef.current.style.left = `${e.clientX + 15}px`;
                        tooltipRef.current.style.top = `${e.clientY + 15}px`;
                      }
                    }}
                    onMouseMove={handleChartMouseMove}
                    onMouseLeave={() => setTooltipData(prev => ({ ...prev, show: false }))}
                    onFocus={() => setTooltipData({ show: true, data: { name: 'Selesai', count: completedCount, percent: '9.1' }, isKeyboard: true })}
                    onBlur={() => setTooltipData(prev => ({ ...prev, show: false }))}
                    aria-describedby="chart-tooltip"
                  >
                    <title>{`Selesai: ${completedCount} siswa (9.1%)`}</title>
                  </circle>
                  {/* Segment 4: Bermasalah (Red - 1/11 = 9.1%) */}
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9155"
                    fill="none"
                    stroke="#EF4444"
                    strokeWidth="3.5"
                    strokeDasharray="9.1, 100"
                    strokeDashoffset="-90.8"
                    tabIndex={0}
                    className="focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
                    onMouseEnter={(e) => {
                      setTooltipData({ show: true, data: { name: 'Bermasalah', count: issueCount, percent: '9.1' }, isKeyboard: false });
                      if (tooltipRef.current) {
                        tooltipRef.current.style.left = `${e.clientX + 15}px`;
                        tooltipRef.current.style.top = `${e.clientY + 15}px`;
                      }
                    }}
                    onMouseMove={handleChartMouseMove}
                    onMouseLeave={() => setTooltipData(prev => ({ ...prev, show: false }))}
                    onFocus={() => setTooltipData({ show: true, data: { name: 'Bermasalah', count: issueCount, percent: '9.1' }, isKeyboard: true })}
                    onBlur={() => setTooltipData(prev => ({ ...prev, show: false }))}
                    aria-describedby="chart-tooltip"
                  >
                    <title>{`Bermasalah: ${issueCount} siswa (9.1%)`}</title>
                  </circle>
                </svg>

                {/* Donut Center Label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="text-xl font-bold font-mono text-[var(--card-title)] leading-none">{totalStudents}</span>
                  <span className="text-[10px] text-[var(--card-subtitle)] font-semibold mt-0.5 uppercase">Siswa</span>
                </div>

                {/* Tooltip */}
                {tooltipData.show && tooltipData.data && (
                  <div
                    id="chart-tooltip"
                    role="tooltip"
                    ref={tooltipRef}
                    className={`bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-md px-3 py-2 text-sm pointer-events-none z-50 whitespace-nowrap text-left ${tooltipData.isKeyboard ? 'absolute -top-16 left-1/2 -translate-x-1/2' : 'fixed'}`}
                  >
                    <p className="font-semibold text-gray-800 dark:text-gray-100">{tooltipData.data.name}</p>
                    <p className="text-gray-600 dark:text-gray-300">{tooltipData.data.count} siswa</p>
                    <p className="text-gray-600 dark:text-gray-500">{tooltipData.data.percent}%</p>
                  </div>
                )}
              </div>

              {/* Status Legends */}
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-xs w-full max-w-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#1E3A8A]" />
                    <span className="text-[var(--card-subtitle)] font-medium">Aktif</span>
                  </div>
                  <span className="font-bold text-[var(--card-title)] font-mono">{activeCount}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="text-[var(--card-subtitle)] font-medium">Pembekalan</span>
                  </div>
                  <span className="font-bold text-[var(--card-title)] font-mono">{pembekalanCount}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-[var(--card-subtitle)] font-medium">Selesai</span>
                  </div>
                  <span className="font-bold text-[var(--card-title)] font-mono">{completedCount}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <span className="text-[var(--card-subtitle)] font-medium">Bermasalah</span>
                  </div>
                  <span className="font-bold text-[var(--card-title)] font-mono">{issueCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Horizontal Progress Bar */}
          <div className="pt-4 border-t border-[var(--card-border)]">
            <div className="flex justify-between text-xs font-semibold text-[var(--card-subtitle)] mb-2">
              <span>Progres Angkatan — 60% Berjalan</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 flex overflow-hidden mb-3">
              <div style={{ width: "54.5%" }} className="bg-[#1E3A8A] h-full" title="Aktif" />
              <div style={{ width: "27.2%" }} className="bg-amber-500 h-full" title="Pembekalan" />
              <div style={{ width: "9.1%" }} className="bg-emerald-500 h-full" title="Selesai" />
              <div style={{ width: "9.1%" }} className="bg-red-500 h-full" title="Bermasalah" />
            </div>
            {/* Progress Segment Labels */}
            <div className="flex items-center gap-4 text-[10px] font-semibold text-[var(--text-muted)] flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#1E3A8A]" /> Aktif (54.5%)
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> Pembekalan (27.2%)
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Selesai (9.1%)
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500" /> Bermasalah (9.1%)
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Panel "Perhatian Khusus" */}
        <div className="p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-[var(--card-shadow)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Perlu Tindakan ({attentionStudents.length})</span>
              </h3>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300">
                Prioritas
              </span>
            </div>

            <p className="text-xs text-[var(--card-subtitle)] mb-4 leading-relaxed font-normal">
              Siswa dengan presensi &lt;85% atau belum mengisi jurnal harian &gt;2 hari.
            </p>

            {/* Attention Student Items (Max 3, strictly initial avatar) */}
            {attentionStudents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-[var(--card-border)]">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
                <p className="text-sm font-bold text-[var(--card-title)]">Semua siswa dalam kondisi baik hari ini</p>
              </div>
            ) : (
              <div className="space-y-3">
                {attentionStudents.slice(0, 3).map((std) => (
                  <div
                    key={std.id}
                    onClick={() => setSelectedStudentModal(std)}
                    className="p-3.5 rounded-xl bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 flex items-center justify-between gap-3 cursor-pointer hover:border-red-300 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-red-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                        {getInitials(std.name)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-[var(--card-title)] truncate">{std.name}</h4>
                        <p className="text-[11px] text-[var(--card-subtitle)] truncate">{std.dudiName}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-bold text-red-600 dark:text-red-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md border border-red-200 dark:border-red-800 block">
                        {std.attendanceRate}% Presensi
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[var(--card-border)] flex items-center justify-between">
            {attentionStudents.length > 0 ? (
              <button
                onClick={() => setRoute("absensi")}
                type="button"
                className="py-2 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition"
              >
                <span>Tindak Lanjuti</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div />
            )}

            <button
              onClick={() => setRoute("absensi")}
              type="button"
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Lihat riwayat</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ==========================================
          BAGIAN 4: TABEL "DAFTAR SISWA & PENEMPATAN"
         ========================================== */}
      <div className="p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-[var(--card-shadow)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-[var(--card-title)]">Daftar Siswa & Penempatan</h3>
            <p className="text-xs text-[var(--card-subtitle)] mt-0.5">
              Ringkasan status siswa selama pelaksanaan PKL.
            </p>
          </div>

          {/* Top Right Segmented Filters + Lihat Semua */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-[var(--surface-alt)] p-1 rounded-full border border-[var(--card-border)] overflow-x-auto">
              {["Semua", "Aktif", "Pembekalan", "Selesai", "Bermasalah"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  type="button"
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    statusFilter === st
                      ? "bg-[#1E3A8A] text-white shadow-xs font-bold"
                      : "text-[var(--card-subtitle)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <button
              onClick={() => setRoute("master-data")}
              type="button"
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer whitespace-nowrap hidden sm:flex"
            >
              <span>Lihat semua</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Lightweight Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--card-border)] bg-[var(--surface-alt)] text-[var(--card-subtitle)] font-semibold">
                <th className="py-3 px-4 w-10 text-center">
                  <button onClick={() => setSelectedStudents(filteredStudents.length > 0 && selectedStudents.length === filteredStudents.length ? [] : filteredStudents.map(s => s.id))} className="cursor-pointer">
                    {filteredStudents.length > 0 && selectedStudents.length === filteredStudents.length ? (
                      <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <Square className="w-4 h-4 text-[var(--text-muted)]" />
                    )}
                  </button>
                </th>
                <th
                  onClick={() => handleSort('name')}
                  className="py-3 px-4 cursor-pointer select-none hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                  aria-sort={sortConfig.key === 'name' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                >
                  <span className="flex items-center gap-1">
                    Nama Siswa
                    <SortIcon column="name" />
                  </span>
                </th>
                <th className="py-3 px-4">Kelas & Jurusan</th>
                <th className="py-3 px-4">Perusahaan DUDI</th>
                <th
                  onClick={() => handleSort('stage')}
                  className="py-3 px-4 cursor-pointer select-none hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                  aria-sort={sortConfig.key === 'stage' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                >
                  <span className="flex items-center gap-1">
                    Tahapan PKL
                    <SortIcon column="stage" />
                  </span>
                </th>
                <th
                  onClick={() => handleSort('attendance')}
                  className="py-3 px-4 cursor-pointer select-none hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                  aria-sort={sortConfig.key === 'attendance' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                >
                  <span className="flex items-center gap-1">
                    Presensi
                    <SortIcon column="attendance" />
                  </span>
                </th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--card-border)] text-[var(--foreground)]">
              {filteredStudents.map((std) => (
                <tr
                  key={std.id}
                  onClick={() => setSelectedStudentModal(std)}
                  className={`transition-colors cursor-pointer ${selectedStudents.includes(std.id) ? "bg-blue-50/50 dark:bg-blue-900/10" : "hover:bg-[var(--table-hover-bg)]"}`}
                >
                  <td className="py-3.5 px-4 text-center" onClick={(e) => { e.stopPropagation(); setSelectedStudents(prev => prev.includes(std.id) ? prev.filter(id => id !== std.id) : [...prev, std.id]) }}>
                    <button className="cursor-pointer">
                      {selectedStudents.includes(std.id) ? (
                        <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <Square className="w-4 h-4 text-[var(--text-muted)]" />
                      )}
                    </button>
                  </td>
                  <td className="py-3.5 px-4 font-bold flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-slate-900 dark:bg-slate-800 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                      {getInitials(std.name)}
                    </div>
                    <div>
                      <p className="text-xs font-bold">{std.name}</p>
                      <p className="text-[10px] text-[var(--text-muted)]">{std.nisn}</p>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-semibold">{std.class}</p>
                    <p className="text-[10px] text-[var(--text-muted)]">{std.department}</p>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-[#1E3A8A] dark:text-blue-400">
                    {std.dudiName}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-[var(--text-secondary)]">
                    {std.stage}
                  </td>
                  <td className="py-3.5 px-4 font-bold">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] ${
                        std.attendanceRate >= 90
                          ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                          : "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300"
                      }`}
                    >
                      {std.attendanceRate}%
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={std.status} />
                  </td>
                </tr>
              ))}

              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[var(--text-muted)] text-xs font-medium">
                    <div className="flex flex-col items-center justify-center">
                      <Inbox className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
                      Tidak ada siswa yang cocok dengan filter ini.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination UI Mock */}
        <div className="flex items-center justify-between pt-4 border-t border-[var(--card-border)] text-xs text-[var(--card-subtitle)] font-medium">
          <p>Menampilkan {filteredStudents.length} dari {students.length} siswa</p>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1.5 rounded-lg border border-[var(--card-border)] hover:bg-[var(--surface-alt)] cursor-not-allowed opacity-50">Sebelumnya</button>
            <button className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold cursor-pointer">1</button>
            <button className="px-3 py-1.5 rounded-lg border border-[var(--card-border)] hover:bg-[var(--surface-alt)] cursor-pointer">Selanjutnya</button>
          </div>
        </div>
      </div>

      {/* ==========================================
          BAGIAN 5: AKTIVITAS TERBARU
         ========================================== */}
      <div className="p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-[var(--card-shadow)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-[var(--card-title)]">Aktivitas Terbaru</h3>
            <p className="text-xs text-[var(--card-subtitle)] mt-0.5">
              Jurnal dan absensi terakhir.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-[var(--surface-alt)] p-1 rounded-full border border-[var(--card-border)] overflow-x-auto">
              {(["Semua", "Jurnal", "Absensi"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActivityTab(tab)}
                  type="button"
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] ${
                    activityTab === tab
                      ? "bg-[var(--brand-primary)] text-white shadow-xs font-bold"
                      : "text-[var(--text-muted)] hover:text-[var(--foreground)] bg-transparent"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <button
              onClick={() => setRoute("jurnal")}
              type="button"
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer hidden sm:flex"
            >
              <span>Lihat semua</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Activity Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--card-border)] bg-[var(--surface-alt)] text-[var(--card-subtitle)] font-semibold">
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Nama Siswa</th>
                <th className="py-3 px-4">Tipe</th>
                <th className="py-3 px-4">Deskripsi Aktivitas</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--card-border)] text-[var(--foreground)]">
              {activityFeed.filter(a => activityTab === "Semua" || a.type === activityTab).map((act) => (
                <tr key={act.id} className="hover:bg-[var(--table-hover-bg)] transition-colors">
                  <td className="py-3.5 px-4 font-mono text-[var(--text-muted)] whitespace-nowrap">{act.date}</td>
                  <td className="py-3.5 px-4 font-bold">{act.studentName}</td>
                  <td className="py-3.5 px-4 font-semibold text-[var(--text-muted)]">{act.type}</td>
                  <td className="py-3.5 px-4 font-medium text-[var(--text-primary)]">
                    {act.description}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        act.status === "Terverifikasi" || act.status === "Hadir"
                          ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                          : "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
                      }`}
                    >
                      {act.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* STUDENT DETAIL MODAL */}
      {selectedStudentModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 relative">
            <button
              onClick={() => setSelectedStudentModal(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--text-muted)] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-slate-900 dark:bg-blue-600 text-white font-bold text-lg flex items-center justify-center shrink-0">
                {getInitials(selectedStudentModal.name)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-[var(--card-title)]">{selectedStudentModal.name}</h3>
                <p className="text-xs text-[var(--card-subtitle)]">
                  {selectedStudentModal.nisn} · {selectedStudentModal.class}
                </p>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                  {selectedStudentModal.stage}
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs mb-6 bg-[var(--surface-alt)] p-4 rounded-2xl border border-[var(--card-border)] font-normal">
              <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-slate-800/50">
                <span className="text-[var(--text-muted)]">Mitra DUDI</span>
                <span className="font-bold text-[var(--card-title)]">{selectedStudentModal.dudiName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-slate-800/50">
                <span className="text-[var(--text-muted)]">Guru Pembimbing</span>
                <span className="font-semibold text-[var(--card-title)]">{selectedStudentModal.schoolSupervisor}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-slate-800/50">
                <span className="text-[var(--text-muted)]">Pembimbing Industri</span>
                <span className="font-semibold text-[var(--card-title)]">{selectedStudentModal.industrySupervisor}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-slate-800/50">
                <span className="text-[var(--text-muted)]">Presensi Kehadiran</span>
                <span className="font-bold text-emerald-600">{selectedStudentModal.attendanceRate}%</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[var(--text-muted)]">Jurnal Harian Terisi</span>
                <span className="font-bold text-blue-600">{selectedStudentModal.journalCount} Hari</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedStudentModal(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-blue-600 text-white text-xs font-semibold cursor-pointer"
            >
              Tutup Rincian
            </button>
          </div>
        </div>
      )}

      {/* NOTIFICATIONS MODAL / DROPDOWN */}
      {isNotifModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 relative">
            <button
              onClick={() => setIsNotifModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--text-muted)] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <Bell className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-bold text-[var(--card-title)]">Notifikasi Real-time</h3>
            </div>

            <div className="space-y-3 mb-6">
              <div
                onClick={() => {
                  setRoute("absensi");
                  setIsNotifModalOpen(false);
                }}
                className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5 cursor-pointer"
              >
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">1 Presensi Anomali</p>
                  <p className="text-[11px] opacity-80 mt-0.5">Siti Nurhaliza terlambat presensi QR.</p>
                </div>
              </div>

              <div
                onClick={() => {
                  setRoute("jurnal");
                  setIsNotifModalOpen(false);
                }}
                className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2.5 cursor-pointer"
              >
                <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">1 Jurnal Menunggu Review</p>
                  <p className="text-[11px] opacity-80 mt-0.5">Fitri Handayani mengirim jurnal baru.</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsNotifModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-blue-600 text-white text-xs font-semibold cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Floating Action Bar for Table Multi-select */}
      {selectedStudents.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#181D27] text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-5">
          <span className="text-sm font-semibold">{selectedStudents.length} dipilih</span>
          <div className="w-px h-4 bg-slate-700" />
          <button className="text-sm font-semibold hover:text-slate-600 cursor-pointer">Ekspor</button>
          <button className="text-sm font-semibold hover:text-slate-600 cursor-pointer">Tandai</button>
          <button onClick={() => setSelectedStudents([])} className="text-sm font-semibold text-[var(--text-muted)] hover:text-white cursor-pointer ml-2">Tutup</button>
        </div>
      )}
    </div>
  );
}
