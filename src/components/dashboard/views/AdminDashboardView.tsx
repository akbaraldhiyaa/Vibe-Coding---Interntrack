"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  Briefcase,
  ChevronUp,
  ChevronDown,
  CheckSquare,
  Square,
  Inbox,
  ChevronsUpDown,
  ShieldCheck,
  Layers
} from "lucide-react";
import { useInternTrackStore, Student } from "@/shared/store/useInternTrackStore";
import { StatusBadge } from "@/components/ui/StatusBadge";

export default function AdminDashboardView() {
  const router = useRouter();
  const {
    students,
    dudiList,
    attendanceRecords,
    journals,
    searchQuery,
    userProfile,
  } = useInternTrackStore();

  const [departmentFilter, setDepartmentFilter] = useState<string>("Semua");
  const [statusFilter, setStatusFilter] = useState<string>("Semua");
  const [selectedStudentModal, setSelectedStudentModal] = useState<Student | null>(null);
  const [activityTab, setActivityTab] = useState<"Semua" | "Jurnal" | "Absensi">("Semua");
  const [sortConfig, setSortConfig] = useState<{ key: "name" | "attendance" | "stage" | null, direction: "asc" | "desc" | null }>({ key: null, direction: null });
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipData, setTooltipData] = useState<{ show: boolean, data: { name: string, count: number, percent: string } | null, isKeyboard: boolean }>({ show: false, data: null, isKeyboard: false });

  // Extract unique departments from students
  const availableDepartments = useMemo(() => {
    const depts = new Set<string>();
    students.forEach((s) => {
      if (s.department && s.department.trim()) depts.add(s.department.trim());
    });
    return ["Semua", ...Array.from(depts)];
  }, [students]);

  // Filter students by department first
  const deptFilteredStudents = useMemo(() => {
    if (departmentFilter === "Semua") return students;
    return students.filter((s) => s.department === departmentFilter);
  }, [students, departmentFilter]);

  const totalStudents = deptFilteredStudents.length;
  const activeCount = deptFilteredStudents.filter((s) => s.status === "Aktif").length;
  const pembekalanCount = deptFilteredStudents.filter((s) => s.status === "Pembekalan").length;
  const completedCount = deptFilteredStudents.filter((s) => s.status === "Selesai").length;
  const issueCount = deptFilteredStudents.filter((s) => s.status === "Bermasalah").length;

  const activePct = totalStudents > 0 ? (activeCount / totalStudents) * 100 : 0;
  const pembekalanPct = totalStudents > 0 ? (pembekalanCount / totalStudents) * 100 : 0;
  const completedPct = totalStudents > 0 ? (completedCount / totalStudents) * 100 : 0;
  const issuePct = totalStudents > 0 ? (issueCount / totalStudents) * 100 : 0;
  const progressPct = totalStudents > 0 ? Math.round(((activeCount + completedCount) / totalStudents) * 100) : 0;

  const activeDudiCount = dudiList.length;
  const pendingJournalsCount = journals.filter((j) => j.status === "Menunggu verifikasi").length;
  const attentionStudents = deptFilteredStudents.filter((s) => s.status === "Bermasalah" || s.attendanceRate < 85);

  const filteredStudents = useMemo(() => {
    return deptFilteredStudents
      .filter((s) => {
        const matchesSearch =
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.nisn.includes(searchQuery) ||
          s.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.class.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.dudiName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "Semua" || s.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (!sortConfig.key || !sortConfig.direction) return 0;
        if (sortConfig.key === "attendance") {
          const aVal = a.attendanceRate;
          const bVal = b.attendanceRate;
          if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
          if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
          return 0;
        }
        const key = sortConfig.key;
        const aVal = a[key];
        const bVal = b[key];
        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
  }, [deptFilteredStudents, searchQuery, statusFilter, sortConfig]);

  const activityFeed = useMemo(() => {
    const journalActivities = journals.map((j) => ({
      id: `act-j-${j.id}`,
      date: j.date || "-",
      studentName: j.studentName,
      type: "Jurnal" as const,
      description: j.title ? `${j.title} — ${j.description}` : j.description,
      status: j.status,
    }));

    const attendanceActivities = attendanceRecords.map((a) => ({
      id: `act-a-${a.id}`,
      date: a.date || "-",
      studentName: a.studentName,
      type: "Absensi" as const,
      description: `${a.status}${a.timeIn ? ` - Masuk ${a.timeIn}` : ""}${a.dudiName ? ` (${a.dudiName})` : ""}`,
      status: a.status,
    }));

    return [...journalActivities, ...attendanceActivities].slice(0, 6);
  }, [journals, attendanceRecords]);

  const handleSort = (key: "name" | "attendance" | "stage") => {
    let newDirection: "asc" | "desc" | null = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      newDirection = "desc";
    } else if (sortConfig.key === key && sortConfig.direction === "desc") {
      newDirection = null;
    }
    setSortConfig({ key: newDirection ? key : null, direction: newDirection });
  };

  const SortIcon = ({ column }: { column: "name" | "attendance" | "stage" }) => {
    if (sortConfig.key !== column) return <ChevronsUpDown size={14} className="text-gray-400" />;
    return sortConfig.direction === "asc" ? <ChevronUp size={14} className="text-blue-500" /> : <ChevronDown size={14} className="text-blue-500" />;
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* ADMIN HERO HEADER */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/30 text-blue-200 border border-blue-400/30 uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Admin Sekolah / Tata Usaha</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-white border border-white/10">
                Akses Seluruh Sekolah
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Dashboard Manajemen PKL</h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
              Pantau seluruh aktivitas siswa, pembimbing, dan mitra industri SMKN 3 Jakarta.
            </p>
          </div>

          {/* DEPARTMENT SCOPE SELECTOR */}
          <div className="flex items-center gap-2 bg-white/10 p-1.5 rounded-xl border border-white/15">
            <span className="text-xs font-semibold px-2 text-slate-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>Jurusan:</span>
            </span>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="bg-slate-900 text-white text-xs font-bold py-1.5 px-3 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {availableDepartments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept === "Semua" ? "Semua Jurusan (Global)" : dept}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 4 SUMMARY METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Siswa */}
        <div
          onClick={() => router.push("/dashboard/data-master")}
          className="p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-[var(--card-shadow)] flex flex-col justify-between cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition"
        >
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-[var(--text-secondary)]">Total Siswa Terdaftar</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-3">
            <h2 className="text-3xl font-bold text-[var(--text-primary)] font-mono">{totalStudents}</h2>
            <p className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              <span>{departmentFilter === "Semua" ? "Seluruh Sekolah" : departmentFilter}</span>
            </p>
          </div>
        </div>

        {/* Card 2: Sedang Berjalan */}
        <div
          onClick={() => router.push("/dashboard/kanban")}
          className="p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-[var(--card-shadow)] flex flex-col justify-between cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition"
        >
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-[var(--text-secondary)]">Sedang Berjalan</span>
            <Building2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-3">
            <h2 className="text-3xl font-bold text-[var(--text-primary)] font-mono">{activeCount}</h2>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Aktif di DUDI</span>
            </p>
          </div>
        </div>

        {/* Card 3: Jurnal Menunggu Review */}
        <div
          onClick={() => router.push("/dashboard/jurnal")}
          className="p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-[var(--card-shadow)] flex flex-col justify-between cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition"
        >
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-[var(--text-secondary)]">Jurnal Menunggu Review</span>
            <BookCheck className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-3">
            <h2 className="text-3xl font-bold text-[var(--text-primary)] font-mono">{pendingJournalsCount}</h2>
            <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Perlu Verifikasi</span>
            </p>
          </div>
        </div>

        {/* Card 4: Total Mitra DUDI */}
        <div
          onClick={() => router.push("/dashboard/data-master")}
          className="p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-[var(--card-shadow)] flex flex-col justify-between cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition"
        >
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-[var(--text-secondary)]">Total Mitra DUDI</span>
            <Briefcase className="w-4 h-4 text-purple-500" />
          </div>
          <div className="mt-3">
            <h2 className="text-3xl font-bold text-[var(--text-primary)] font-mono">{activeDudiCount}</h2>
            <p className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold mt-1 flex items-center gap-1">
              <Building2 className="w-3 h-3" />
              <span>Perusahaan Terdaftar</span>
            </p>
          </div>
        </div>
      </div>

      {/* TWO COLUMN SUMMARY SECTION: STATUS DISTRIBUTION & ATTENTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column (2 Cols): Distribusi Status */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-[var(--card-shadow)] flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest block mb-1">
              DISTRIBUSI STATUS PENEMPATAN
            </span>
            <h3 className="text-base font-bold text-[var(--card-title)] mb-6">Status Siswa PKL</h3>

            <div className="flex flex-col sm:flex-row items-center gap-8 justify-around mb-6">
              {/* Donut Chart */}
              <div className="relative w-40 h-40 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.9155" fill="none" stroke="var(--surface-alt)" strokeWidth="3.5" />
                  {activeCount > 0 && (
                    <circle
                      cx="18" cy="18" r="15.9155" fill="none" stroke="#1E3A8A" strokeWidth="3.5"
                      strokeDasharray={`${activePct.toFixed(1)}, 100`} strokeDashoffset="0"
                    />
                  )}
                  {pembekalanCount > 0 && (
                    <circle
                      cx="18" cy="18" r="15.9155" fill="none" stroke="#F59E0B" strokeWidth="3.5"
                      strokeDasharray={`${pembekalanPct.toFixed(1)}, 100`} strokeDashoffset={`${(-activePct).toFixed(1)}`}
                    />
                  )}
                  {completedCount > 0 && (
                    <circle
                      cx="18" cy="18" r="15.9155" fill="none" stroke="#10B981" strokeWidth="3.5"
                      strokeDasharray={`${completedPct.toFixed(1)}, 100`} strokeDashoffset={`${(-(activePct + pembekalanPct)).toFixed(1)}`}
                    />
                  )}
                  {issueCount > 0 && (
                    <circle
                      cx="18" cy="18" r="15.9155" fill="none" stroke="#EF4444" strokeWidth="3.5"
                      strokeDasharray={`${issuePct.toFixed(1)}, 100`} strokeDashoffset={`${(-(activePct + pembekalanPct + completedPct)).toFixed(1)}`}
                    />
                  )}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="text-xl font-bold font-mono text-[var(--card-title)] leading-none">{totalStudents}</span>
                  <span className="text-[10px] text-[var(--card-subtitle)] font-semibold mt-0.5 uppercase">Siswa</span>
                </div>
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

          <div className="pt-4 border-t border-[var(--card-border)]">
            <div className="flex justify-between text-xs font-semibold text-[var(--card-subtitle)] mb-2">
              <span>Progres Angkatan — {progressPct}% Berjalan</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 flex overflow-hidden">
              <div style={{ width: `${activePct}%` }} className="bg-[#1E3A8A] h-full" title="Aktif" />
              <div style={{ width: `${pembekalanPct}%` }} className="bg-amber-500 h-full" title="Pembekalan" />
              <div style={{ width: `${completedPct}%` }} className="bg-emerald-500 h-full" title="Selesai" />
              <div style={{ width: `${issuePct}%` }} className="bg-red-500 h-full" title="Bermasalah" />
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Perlu Tindakan */}
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
            <p className="text-xs text-[var(--card-subtitle)] mb-4">
              Siswa dengan presensi &lt;85% atau berstatus kendala.
            </p>

            {attentionStudents.length === 0 ? (
              <div className="py-6 text-center bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-[var(--card-border)]">
                <CheckCircle2 className="w-7 h-7 text-emerald-500 mx-auto mb-1.5" />
                <p className="text-xs font-bold text-[var(--card-title)]">Semua siswa dalam kondisi baik</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {attentionStudents.slice(0, 3).map((std) => (
                  <div
                    key={std.id}
                    className="p-3 rounded-xl bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <h4 className="font-bold text-[var(--card-title)]">{std.name}</h4>
                      <p className="text-[10px] text-[var(--card-subtitle)]">{std.department} &bull; {std.dudiName}</p>
                    </div>
                    <span className="text-[10px] font-bold text-red-600 dark:text-red-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md border border-red-200 dark:border-red-800">
                      {std.attendanceRate}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[var(--card-border)] flex items-center justify-between">
            <button
              onClick={() => router.push("/dashboard/absensi")}
              type="button"
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Monitoring presensi</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* STUDENT LIST & PLACEMENTS TABLE */}
      <div className="p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-[var(--card-shadow)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-[var(--card-title)]">Daftar Siswa & Penempatan</h3>
            <p className="text-xs text-[var(--card-subtitle)] mt-0.5">
              Menampilkan {filteredStudents.length} siswa ({departmentFilter === "Semua" ? "Semua Jurusan" : departmentFilter})
            </p>
          </div>

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
              onClick={() => router.push("/dashboard/data-master")}
              type="button"
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer whitespace-nowrap"
            >
              <span>Kelola Data</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs min-w-[780px]">
            <thead>
              <tr className="border-b border-[var(--card-border)] bg-[var(--surface-alt)] text-[var(--card-subtitle)] font-semibold">
                <th
                  onClick={() => handleSort('name')}
                  className="py-3 px-4 cursor-pointer select-none hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
                >
                  <span className="flex items-center gap-1">
                    Nama Siswa
                    <SortIcon column="name" />
                  </span>
                </th>
                <th className="py-3 px-4 whitespace-nowrap">Kelas & Jurusan</th>
                <th className="py-3 px-4 whitespace-nowrap">Perusahaan DUDI</th>
                <th
                  onClick={() => handleSort('stage')}
                  className="py-3 px-4 cursor-pointer select-none hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
                >
                  <span className="flex items-center gap-1">
                    Tahapan PKL
                    <SortIcon column="stage" />
                  </span>
                </th>
                <th
                  onClick={() => handleSort('attendance')}
                  className="py-3 px-4 cursor-pointer select-none hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
                >
                  <span className="flex items-center gap-1">
                    Presensi
                    <SortIcon column="attendance" />
                  </span>
                </th>
                <th className="py-3 px-4 whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--card-border)] text-[var(--foreground)]">
              {filteredStudents.map((std) => (
                <tr key={std.id} className="hover:bg-[var(--table-hover-bg)] transition-colors">
                  <td className="py-3.5 px-4 font-bold">
                    <p className="text-xs font-bold">{std.name}</p>
                    <p className="text-[10px] text-[var(--text-muted)] font-mono">{std.nisn}</p>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <p className="font-semibold">{std.class}</p>
                    <p className="text-[10px] text-[var(--text-muted)]">{std.department}</p>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-[#1E3A8A] dark:text-blue-400 whitespace-nowrap">
                    {std.dudiName}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-[var(--text-secondary)] whitespace-nowrap">
                    {std.stage}
                  </td>
                  <td className="py-3.5 px-4 font-bold whitespace-nowrap">
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
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <StatusBadge status={std.status} />
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[var(--text-muted)] text-xs font-medium">
                    <Inbox className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    Tidak ada siswa yang cocok dengan kriteria ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* AKTIVITAS TERBARU */}
      <div className="p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-[var(--card-shadow)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-[var(--card-title)]">Aktivitas Terbaru Seluruh Sekolah</h3>
            <p className="text-xs text-[var(--card-subtitle)] mt-0.5">
              Jurnal dan absensi siswa terbaru.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-[var(--surface-alt)] p-1 rounded-full border border-[var(--card-border)]">
            {(["Semua", "Jurnal", "Absensi"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActivityTab(tab)}
                type="button"
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  activityTab === tab
                    ? "bg-[#1E3A8A] text-white shadow-xs font-bold"
                    : "text-[var(--text-muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs min-w-[650px]">
            <thead>
              <tr className="border-b border-[var(--card-border)] bg-[var(--surface-alt)] text-[var(--card-subtitle)] font-semibold">
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Nama Siswa</th>
                <th className="py-3 px-4">Tipe</th>
                <th className="py-3 px-4">Deskripsi Aktivitas</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--card-border)]">
              {activityFeed.filter((a) => activityTab === "Semua" || a.type === activityTab).map((act) => (
                <tr key={act.id} className="hover:bg-[var(--table-hover-bg)] transition-colors">
                  <td className="py-3 px-4 font-mono text-[var(--text-muted)] whitespace-nowrap">{act.date}</td>
                  <td className="py-3 px-4 font-bold whitespace-nowrap">{act.studentName}</td>
                  <td className="py-3 px-4 font-semibold text-[var(--text-muted)] whitespace-nowrap">{act.type}</td>
                  <td className="py-3 px-4 text-[var(--text-primary)]">{act.description}</td>
                  <td className="py-3 px-4 whitespace-nowrap">
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
              {activityFeed.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-[var(--text-muted)]">
                    Belum ada aktivitas tercatat.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
