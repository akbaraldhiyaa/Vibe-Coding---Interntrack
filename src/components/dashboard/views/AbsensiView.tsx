"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Search,
  ChevronDown,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  Download,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  CalendarDays,
  UserCheck,
  UserX,
  ScanLine,
} from "lucide-react";
import FocusLock from "react-focus-lock";
import { useInternTrackStore, AttendanceRecord } from "@/shared/store/useInternTrackStore";
import AddAttendanceModal from "../modals/AddAttendanceModal";
import QrScannerModal from "../modals/QrScannerModal";

/* ────────────────────────── STATUS CONFIG ────────────────────────── */
const STATUS_OPTIONS = ["Semua Status", "Hadir", "Terlambat", "Izin", "Sakit", "Tidak Hadir"] as const;

const statusBadge: Record<string, { bg: string; text: string; dot: string }> = {
  Hadir: {
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-700 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
  Terlambat: {
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-700 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  Izin: {
    bg: "bg-blue-50 dark:bg-blue-950/40",
    text: "text-blue-700 dark:text-blue-300",
    dot: "bg-blue-500",
  },
  Sakit: {
    bg: "bg-violet-50 dark:bg-violet-950/40",
    text: "text-violet-700 dark:text-violet-300",
    dot: "bg-violet-500",
  },
  "Tidak Hadir": {
    bg: "bg-red-50 dark:bg-red-950/40",
    text: "text-red-700 dark:text-red-300",
    dot: "bg-red-500",
  },
  Anomali: {
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-700 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  Alpa: {
    bg: "bg-red-50 dark:bg-red-950/40",
    text: "text-red-700 dark:text-red-300",
    dot: "bg-red-500",
  },
};

const ITEMS_PER_PAGE = 10;

/* ────────────────────────── SKELETON ROW ─────────────────────────── */
function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} className="py-4 px-5">
          <div className="h-3.5 rounded-md bg-[var(--skeleton-bg)]" style={{ width: i === 0 ? "60%" : i === 6 ? "50px" : "70%" }} />
        </td>
      ))}
    </tr>
  );
}

/* ══════════════════════ MAIN COMPONENT ══════════════════════════════ */
export default function AbsensiView() {
  const {
    attendanceRecords,
    students,
    dudiList,
    addAttendanceRecord,
    updateAttendanceRecord,
    deleteAttendanceRecord,
    addToast,
    currentRole,
  } = useInternTrackStore();

  const isAdmin = currentRole === "Admin" || currentRole === "Guru Pembimbing" || currentRole === "Pembimbing Industri";

  /* ── Search / filter / pagination ──────────────────────────────── */
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Semua Status");
  const [currentPage, setCurrentPage] = useState(1);

  /* ── Delete confirmation ───────────────────────────────────────── */
  const [deleteTarget, setDeleteTarget] = useState<AttendanceRecord | null>(null);

  /* ── Modal state ───────────────────────────────────────────────── */
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  /* ── Handle ESC Key ────────────────────────────────────────────── */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsAddModalOpen(false);
        setEditingRecord(null);
        setDeleteTarget(null);
      }
    };
    if (isAddModalOpen || editingRecord || deleteTarget) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isAddModalOpen, editingRecord, deleteTarget]);

  /* ── Derived data ──────────────────────────────────────────────── */
  const filteredRecords = useMemo(() => {
    return attendanceRecords.filter((rec) => {
      const q = searchQuery.toLowerCase();
      const matchSearch = rec.studentName.toLowerCase().includes(q) || rec.dudiName.toLowerCase().includes(q);
      const matchStatus = selectedStatus === "Semua Status" || rec.status === selectedStatus;
      return matchSearch && matchStatus;
    });
  }, [attendanceRecords, searchQuery, selectedStatus]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / ITEMS_PER_PAGE));
  const paginatedRecords = filteredRecords.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  /* ── Summary stats ─────────────────────────────────────────────── */
  const stats = useMemo(() => {
    const today = attendanceRecords;
    return {
      hadir: today.filter((r) => r.status === "Hadir").length,
      terlambat: today.filter((r) => r.status === "Terlambat" || r.status === "Anomali").length,
      izinSakit: today.filter((r) => r.status === "Izin" || r.status === "Sakit").length,
      tidakHadir: today.filter((r) => r.status === "Tidak Hadir" || r.status === "Alpa").length,
    };
  }, [attendanceRecords]);

  /* ── Open Add Modal ────────────────────────────────────────────── */
  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
  };

  /* ── Open Edit Modal ───────────────────────────────────────────── */
  const handleOpenEditModal = (record: AttendanceRecord) => {
    setEditingRecord(record);
  };

  /* ── Confirm Delete ────────────────────────────────────────────── */
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    deleteAttendanceRecord(deleteTarget.id);
    setDeleteTarget(null);
  };

  /* ── QR Scan Success ───────────────────────────────────────────── */
  const handleScanSuccess = (dudiId: string, dudiName: string) => {
    setIsScannerOpen(false);

    // In a real app, we'd know the logged-in student's ID/name.
    // For this simulation, we'll pick the first student that belongs to this DUDI,
    // or just use a generic "Siswa Login" name if none match.
    const myStudent = students.find((s) => s.dudiName === dudiName) || students[0];

    const today = new Date().toISOString().split("T")[0];
    const now = new Date();
    const timeIn = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

    // Cek apakah sudah absen hari ini
    const existing = attendanceRecords.find((r) => r.studentName === myStudent.name && r.date === today);

    if (existing) {
      addToast({ type: "warning", title: "Sudah Absen", message: "Anda sudah melakukan absensi hari ini." });
      return;
    }

    addAttendanceRecord({
      studentName: myStudent.name,
      dudiName: dudiName,
      date: today,
      timeIn: timeIn,
      status: "Hadir",
    });

    addToast({ type: "success", title: "Absen Berhasil", message: `Kehadiran dicatat pukul ${timeIn}` });
  };

  /* ── Export CSV ─────────────────────────────────────────────────── */
  const handleExportCSV = () => {
    const headers = ["Siswa", "Perusahaan DUDI", "Tanggal", "Masuk", "Pulang", "Status"];
    const rows = filteredRecords.map((rec) => [
      rec.studentName,
      rec.dudiName,
      rec.date || "-",
      rec.timeIn || "-",
      rec.timeOut || "—",
      rec.status,
    ]);

    const csvContent = [headers.join(","), ...rows.map((row) => row.map((v) => `"${v}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `absensi-interntrack-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    addToast({ type: "success", title: "Export Berhasil", message: "Data absensi telah diunduh sebagai CSV." });
  };

  /* ── Retry (simulated) ─────────────────────────────────────────── */
  const handleRetry = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1200);
  };

  /* ── Badge component ───────────────────────────────────────────── */
  const StatusBadge = ({ status }: { status: string }) => {
    const cfg = statusBadge[status] || statusBadge["Hadir"];
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${cfg.bg} ${cfg.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
        {status}
      </span>
    );
  };

  /* ══════════════════════════════ RENDER ═══════════════════════════ */
  return (
    <div className="space-y-5 max-w-full">
      {/* ─── PAGE HEADER ───────────────────────────────────────────── */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--foreground)]">Absensi</h1>
        <p className="text-[13px] text-[var(--card-subtitle)] mt-1">
          Kelola dan pantau kehadiran harian siswa selama pelaksanaan PKL.
        </p>
      </div>

      {/* ─── SUMMARY CARDS ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Hadir Hari Ini", value: stats.hadir, icon: CheckCircle2, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
          { label: "Terlambat", value: stats.terlambat, icon: Clock, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/30" },
          { label: "Izin / Sakit", value: stats.izinSakit, icon: CalendarDays, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/30" },
          { label: "Belum Absen", value: stats.tidakHadir, icon: UserX, color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/30" },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="p-4 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <div>
                <p className="text-lg font-bold text-[var(--foreground)] leading-none">{card.value}</p>
                <p className="text-[11px] text-[var(--card-subtitle)] mt-0.5 font-medium">{card.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── MAIN TABLE CARD ───────────────────────────────────────── */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] overflow-hidden shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">

        {/* ── TOOLBAR ──────────────────────────────────────────────── */}
        <div className="p-5 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Left: Search */}
          <div className="relative flex-1 max-w-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--input-placeholder)]">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Cari nama siswa atau perusahaan DUDI"
              className="w-full h-10 pl-9 pr-4 text-sm rounded-lg token-input"
            />
          </div>

          {/* Right: Filters + Actions */}
          <div className="flex items-center gap-2 flex-wrap lg:flex-nowrap">
            {/* Status Filter */}
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
                className="appearance-none h-10 pl-3 pr-8 text-[13px] font-medium rounded-lg token-input cursor-pointer"
              >
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[var(--input-placeholder)] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Export CSV — secondary / outline button */}
            <button
              onClick={handleExportCSV}
              type="button"
              className="h-10 px-3.5 rounded-lg border border-[var(--input-border)] bg-[var(--card-bg)] text-[13px] font-semibold text-[var(--foreground)] hover:bg-[var(--surface-alt)] active:scale-[0.98] transition flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4 text-[var(--card-subtitle)]" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            {/* + Tambah Absensi — primary button */}
            {isAdmin ? (
              <button
                onClick={handleOpenAddModal}
                type="button"
                className="h-10 px-4 rounded-lg bg-[var(--btn-primary-bg)] hover:bg-[var(--btn-primary-hover)] text-white text-[13px] font-semibold flex items-center gap-1.5 shadow-sm active:scale-[0.98] transition cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Tambah Absensi</span>
              </button>
            ) : (
              <button
                onClick={() => setIsScannerOpen(true)}
                type="button"
                className="h-10 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[13px] font-semibold flex items-center gap-1.5 shadow-sm active:scale-[0.98] transition cursor-pointer"
              >
                <ScanLine className="w-4 h-4 stroke-[2.5]" />
                <span>Scan QR Absensi</span>
              </button>
            )}
          </div>
        </div>

        {/* ── Divider ──────────────────────────────────────────────── */}
        <div className="border-t border-[var(--table-border)]" />

        {/* ── MOBILE CARD VIEW ─────────────────────────────────────── */}
        <div className="md:hidden divide-y divide-[var(--table-border)]">
          {isLoading && Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-4 space-y-3 animate-pulse">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-[var(--surface-alt)] rounded" />
                  <div className="h-3 w-24 bg-[var(--surface-alt)] rounded" />
                </div>
                <div className="h-5 w-16 bg-[var(--surface-alt)] rounded-full" />
              </div>
              <div className="h-4 w-40 bg-[var(--surface-alt)] rounded" />
            </div>
          ))}
          
          {!isLoading && paginatedRecords.map((rec) => (
            <div key={rec.id} className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-[var(--foreground)] text-sm">{rec.studentName}</div>
                  <div className="text-[11px] text-[var(--card-subtitle)] mt-0.5">{rec.dudiName}</div>
                </div>
                <StatusBadge status={rec.status} />
              </div>
              
              <div className="flex justify-between items-center text-xs text-[var(--card-subtitle)]">
                <div className="flex items-center gap-2">
                  <span className="font-mono bg-[var(--surface-alt)] px-1.5 py-0.5 rounded text-[10px]">{rec.timeIn || "-"}</span>
                  <span className="text-[10px]">-</span>
                  <span className="font-mono bg-[var(--surface-alt)] px-1.5 py-0.5 rounded text-[10px]">{rec.timeOut || "—"}</span>
                </div>
                <span className="text-[11px] font-medium">{rec.date || "-"}</span>
              </div>
              
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => handleOpenEditModal(rec)}
                  className="p-2 rounded-lg border border-[var(--input-border)] hover:bg-[var(--surface-alt)] text-[var(--card-subtitle)] hover:text-[var(--foreground)] transition cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                {isAdmin && (
                  <button
                    onClick={() => setDeleteTarget(rec)}
                    className="p-2 rounded-lg border border-red-200 dark:border-red-950 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 transition cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}

          {!isLoading && attendanceRecords.length === 0 && (
            <div className="p-8 text-center">
              <UserCheck className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-sm font-semibold text-[var(--foreground)]">Belum ada data</p>
            </div>
          )}
        </div>

        {/* ── DESKTOP TABLE ────────────────────────────────────────── */}
        <div className="hidden md:block overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-[13px] min-w-[760px]">
            <thead>
              <tr className="bg-[var(--table-header-bg)] border-b border-[var(--table-border)] text-[var(--card-subtitle)]">
                <th className="py-3 px-5 font-semibold text-xs whitespace-nowrap">Siswa</th>
                <th className="py-3 px-5 font-semibold text-xs whitespace-nowrap">Perusahaan DUDI</th>
                <th className="py-3 px-5 font-semibold text-xs whitespace-nowrap">Tanggal</th>
                <th className="py-3 px-5 font-semibold text-xs text-center whitespace-nowrap">Masuk</th>
                <th className="py-3 px-5 font-semibold text-xs text-center whitespace-nowrap">Pulang</th>
                <th className="py-3 px-5 font-semibold text-xs text-center whitespace-nowrap">Status</th>
                <th className="py-3 px-5 font-semibold text-xs text-right whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--table-border)]">
              {/* Loading skeleton */}
              {isLoading && Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)}

              {/* Data rows */}
              {!isLoading && paginatedRecords.map((rec) => (
                <tr key={rec.id} className="hover:bg-[var(--table-hover-bg)] transition-colors group">
                  <td className="py-3.5 px-5 font-medium text-[var(--table-text)] whitespace-nowrap">{rec.studentName}</td>
                  <td className="py-3.5 px-5 text-[var(--card-subtitle)] whitespace-nowrap">{rec.dudiName}</td>
                  <td className="py-3.5 px-5 text-[var(--card-subtitle)] whitespace-nowrap">{rec.date || "-"}</td>
                  <td className="py-3.5 px-5 text-center font-mono text-[var(--card-subtitle)] text-xs whitespace-nowrap">{rec.timeIn || "-"}</td>
                  <td className="py-3.5 px-5 text-center font-mono text-[var(--card-subtitle)] text-xs whitespace-nowrap">{rec.timeOut || "—"}</td>
                  <td className="py-3.5 px-5 text-center whitespace-nowrap"><StatusBadge status={rec.status} /></td>
                  <td className="py-3.5 px-5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenEditModal(rec)}
                        type="button"
                        className="p-2 rounded-lg hover:bg-[var(--surface-alt)] text-[var(--card-subtitle)] hover:text-[var(--foreground)] transition cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
                        title="Edit Absensi"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => setDeleteTarget(rec)}
                          type="button"
                          className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-[var(--card-subtitle)] hover:text-red-600 dark:hover:text-red-400 transition cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
                          title="Hapus Absensi"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {/* Empty — no data at all */}
              {!isLoading && attendanceRecords.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <UserCheck className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                    <p className="text-sm font-semibold text-[var(--foreground)] mb-1">Belum ada data absensi.</p>
                    <p className="text-xs text-[var(--card-subtitle)] mb-4">Data kehadiran siswa akan muncul di sini setelah dicatat.</p>
                    {isAdmin && (
                      <button
                        onClick={handleOpenAddModal}
                        type="button"
                        className="px-4 py-2 rounded-lg bg-[var(--btn-primary-bg)] hover:bg-[var(--btn-primary-hover)] text-white text-xs font-semibold shadow-sm cursor-pointer transition"
                      >
                        <Plus className="w-3.5 h-3.5 inline mr-1" />Tambah Absensi
                      </button>
                    )}
                  </td>
                </tr>
              )}

              {/* Empty — filtered result empty */}
              {!isLoading && attendanceRecords.length > 0 && filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <Search className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                    <p className="text-sm font-semibold text-[var(--foreground)] mb-1">Tidak ada data yang sesuai.</p>
                    <p className="text-xs text-[var(--card-subtitle)]">Coba ubah kata kunci pencarian atau filter status.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── PAGINATION FOOTER ────────────────────────────────────── */}
        <div className="px-5 py-3 border-t border-[var(--table-border)] flex items-center justify-between text-[13px]">
          <span className="text-[var(--card-subtitle)]">
            Menampilkan {filteredRecords.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredRecords.length)} dari {filteredRecords.length} data
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              type="button"
              className="w-8 h-8 rounded-lg border border-[var(--input-border)] flex items-center justify-center text-[var(--card-subtitle)] hover:text-[var(--foreground)] hover:bg-[var(--surface-alt)] transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              title="Halaman Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 text-[var(--foreground)] font-medium min-w-[40px] text-center">{currentPage}/{totalPages}</span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              type="button"
              className="w-8 h-8 rounded-lg border border-[var(--input-border)] flex items-center justify-center text-[var(--card-subtitle)] hover:text-[var(--foreground)] hover:bg-[var(--surface-alt)] transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              title="Halaman Selanjutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════ ADD / EDIT MODAL ═══════════════════════════ */}
      <AddAttendanceModal
        isOpen={isAddModalOpen || !!editingRecord}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingRecord(null);
        }}
        editTarget={editingRecord}
        isAdmin={isAdmin}
      />

      {/* QR SCANNER MODAL (SISWA) */}
      <QrScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
      />

      {/* ═══════════════ CONFIRM DELETE MODAL ═══════════════════════ */}
      {deleteTarget && (
        <FocusLock>
        <div 
          className="fixed inset-0 z-50 bg-[var(--modal-overlay)] flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeleteTarget(null);
          }}
        >
          <div className="w-full max-w-sm bg-[var(--modal-bg)] border border-[var(--modal-border)] rounded-2xl p-6 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-base font-bold text-[var(--foreground)] mb-1">Hapus Absensi?</h3>
            <p className="text-sm text-[var(--card-subtitle)] mb-5">
              Data presensi <strong>{deleteTarget.studentName}</strong> akan dihapus secara permanen.
            </p>
            <div className="flex items-center gap-3">
              <button onClick={() => setDeleteTarget(null)} type="button" className="flex-1 h-10 rounded-lg border border-[var(--input-border)] text-[var(--foreground)] font-semibold hover:bg-[var(--surface-alt)] transition cursor-pointer text-sm">
                Batal
              </button>
              <button onClick={handleConfirmDelete} type="button" className="flex-1 h-10 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold shadow-sm transition cursor-pointer text-sm">
                Hapus
              </button>
            </div>
          </div>
        </div>
        </FocusLock>
      )}
    </div>
  );
}
