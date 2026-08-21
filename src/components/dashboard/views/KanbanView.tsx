"use client";

import { useState, useEffect } from "react";
import {
  KanbanSquare,
  Search,
  ChevronRight,
  ChevronLeft,
  User,
  Building,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";
import { useInternTrackStore, KanbanStage, Student } from "@/shared/store/useInternTrackStore";

export default function KanbanView() {
  const { students, moveKanbanStage, searchQuery, setSearchQuery } = useInternTrackStore();
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  /* ── Handle ESC Key ────────────────────────────────────────────── */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedStudent(null);
      }
    };
    if (selectedStudent) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedStudent]);

  const stages: KanbanStage[] = [
    "Pendaftaran & Pembekalan",
    "Pelaksanaan (DUDI)",
    "Penilaian & Review",
    "Selesai & Sertifikasi",
  ];

  const filteredStudents = students.filter(
    (s) =>
      (s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.dudiName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.class.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (statusFilter === "Semua" || s.status === statusFilter)
  );

  return (
    <div className="space-y-6">
      {/* HEADER TITLE & SEARCH */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--card-title)] flex items-center gap-2">
            <KanbanSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>Kanban Tahapan PKL</span>
          </h1>
          <p className="text-xs sm:text-sm text-[var(--card-subtitle)] mt-1">
            Pantau pergerakan & siklus progres siswa PKL dari pembekalan hingga penerbitan sertifikat.
          </p>
        </div>

        {/* Search & Action */}
        <div className="w-full sm:w-72">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-600">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama siswa..."
              className="w-full token-input pl-9 pr-3 py-2 text-xs bg-[var(--surface)]"
            />
          </div>
        </div>
      </div>

      {/* 4 COLUMNS KANBAN BOARD */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {stages.map((stageTitle, idx) => {
          const stageStudents = filteredStudents.filter((s) => s.stage === stageTitle);

          return (
            <div
              key={stageTitle}
              className="p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-[var(--card-shadow)] flex flex-col gap-3 min-h-[520px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[var(--card-border)]">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-3 h-3 rounded-full ${
                      idx === 0
                        ? "bg-amber-500"
                        : idx === 1
                        ? "bg-blue-600"
                        : idx === 2
                        ? "bg-indigo-600"
                        : "bg-emerald-500"
                    }`}
                  />
                  <h3 className="text-xs font-bold text-[var(--card-title)] leading-snug">
                    {stageTitle}
                  </h3>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[var(--surface-alt)] text-[var(--card-subtitle)]">
                  {stageStudents.length}
                </span>
              </div>

              {/* Cards list inside column */}
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[640px] pr-1">
                {stageStudents.map((std) => (
                  <div
                    key={std.id}
                    className="p-4 rounded-xl bg-[var(--surface-alt)] border border-[var(--card-border)] hover:border-blue-400 dark:hover:border-blue-600 transition-all shadow-xs space-y-3 cursor-pointer group"
                    onClick={() => setSelectedStudent(std)}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          std.status === "Aktif"
                            ? "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300"
                            : std.status === "Selesai"
                            ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                            : std.status === "Pembekalan"
                            ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
                            : "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300"
                        }`}
                      >
                        {std.status}
                      </span>
                      <span className="text-[10px] font-bold text-slate-600">{std.class}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      {std.avatar ? (
                        <img
                          src={std.avatar}
                          alt={std.name}
                          className="w-9 h-9 rounded-full object-cover shrink-0 border border-slate-200"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0 border border-slate-200">
                          {std.name.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-[var(--card-title)] truncate group-hover:text-blue-600 transition-colors">
                          {std.name}
                        </h4>
                        <p className="text-[11px] text-[var(--card-subtitle)] truncate mt-0.5">
                          {std.dudiName}
                        </p>
                      </div>
                    </div>

                    {/* Stage Movement Controls */}
                    <div
                      className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-[11px]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        disabled={idx === 0}
                        onClick={() => moveKanbanStage(std.id, stages[idx - 1])}
                        type="button"
                        className={`p-1.5 rounded-lg border transition ${
                          idx === 0
                            ? "opacity-30 cursor-not-allowed border-transparent text-slate-600"
                            : "hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 cursor-pointer"
                        }`}
                        title="Pindah ke tahap sebelumnya"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>

                      <span className="text-[10px] text-slate-600 font-semibold">Pindah Tahap</span>

                      <button
                        disabled={idx === stages.length - 1}
                        onClick={() => moveKanbanStage(std.id, stages[idx + 1])}
                        type="button"
                        className={`p-1.5 rounded-lg border transition ${
                          idx === stages.length - 1
                            ? "opacity-30 cursor-not-allowed border-transparent text-slate-600"
                            : "hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 cursor-pointer"
                        }`}
                        title="Pindah ke tahap selanjutnya"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {stageStudents.length === 0 && (
                  <div className="p-6 text-center text-slate-600 text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-xl my-4">
                    Belum ada siswa di tahap ini.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* STUDENT DETAIL MODAL / DRAWER */}
      {selectedStudent && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedStudent(null);
          }}
        >
          <div className="w-full max-w-md bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 relative">
            <button
              onClick={() => setSelectedStudent(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-4 mb-6">
              <img
                src={selectedStudent.avatar}
                alt={selectedStudent.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-blue-500"
              />
              <div>
                <h3 className="text-lg font-bold text-[var(--card-title)]">{selectedStudent.name}</h3>
                <p className="text-xs text-[var(--card-subtitle)]">{selectedStudent.nisn} · {selectedStudent.class}</p>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                  {selectedStudent.stage}
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs mb-6 bg-[var(--surface-alt)] p-4 rounded-2xl border border-[var(--card-border)]">
              <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-slate-800/50">
                <span className="text-slate-600">Mitra DUDI</span>
                <span className="font-bold text-[var(--card-title)]">{selectedStudent.dudiName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-slate-800/50">
                <span className="text-slate-600">Guru Pembimbing</span>
                <span className="font-semibold text-[var(--card-title)]">{selectedStudent.schoolSupervisor}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-slate-800/50">
                <span className="text-slate-600">Pembimbing Industri</span>
                <span className="font-semibold text-[var(--card-title)]">{selectedStudent.industrySupervisor}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-slate-800/50">
                <span className="text-slate-600">Tingkat Kehadiran QR</span>
                <span className="font-bold text-emerald-600">{selectedStudent.attendanceRate}%</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-600">Jurnal Terisi</span>
                <span className="font-bold text-blue-600">{selectedStudent.journalCount} Hari</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedStudent(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-blue-600 text-white text-xs font-semibold"
            >
              Tutup Rincian
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
