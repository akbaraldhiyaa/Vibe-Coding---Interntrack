"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Award,
  X,
  FileCheck,
  Building,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Download,
} from "lucide-react";
import { useInternTrackStore, Student } from "@/shared/store/useInternTrackStore";

const ITEMS_PER_PAGE = 10;

export default function PenilaianView() {
  const {
    students,
    evaluations,
    generateCertificate,
    addToast,
    currentRole,
  } = useInternTrackStore();

  const isAdmin = currentRole === "Admin" || currentRole === "Guru Pembimbing";

  /* ── Search & Pagination ───────────────────────────────────────── */
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  /* ── Modal State ───────────────────────────────────────────────── */
  const [publishTarget, setPublishTarget] = useState<Student | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ── Derived Data for Cards ────────────────────────────────────── */
  const totalStudents = students.length;
  const completedStudents = students.filter((s) => s.status === "Selesai").length;
  const issuedCertificates = evaluations.filter((e) => e.certificateNumber).length;
  const averageScore =
    evaluations.length > 0
      ? (evaluations.reduce((acc, curr) => acc + curr.finalScore, 0) / evaluations.length).toFixed(1)
      : "—";

  /* ── Derived Data for Table ────────────────────────────────────── */
  const filteredStudents = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return students.filter(
      (s) => s.name.toLowerCase().includes(q) || s.dudiName.toLowerCase().includes(q)
    );
  }, [students, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / ITEMS_PER_PAGE));
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  /* ── Actions ───────────────────────────────────────────────────── */
  const handleConfirmPublish = () => {
    if (!publishTarget) return;

    setIsSubmitting(true);
    setTimeout(() => {
      generateCertificate(publishTarget.id);
      setIsSubmitting(false);
      setPublishTarget(null);
    }, 600);
  };

  const handleExportCSV = () => {
    const headers = ["Siswa", "DUDI", "Tahap", "Rata-rata nilai", "Sertifikat"];
    const rows = filteredStudents.map((s) => {
      const evaluation = evaluations.find((e) => e.studentId === s.id);
      return [
        s.name,
        s.dudiName,
        s.stage,
        evaluation ? evaluation.finalScore.toFixed(1) : "—",
        evaluation?.certificateNumber ? "Terbit" : "Belum terbit",
      ];
    });

    const csvContent = [headers.join(","), ...rows.map((row) => row.map((v) => `"${v}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `laporan-sertifikat-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    addToast({ type: "success", title: "Export Berhasil", message: "Data laporan telah diunduh sebagai CSV." });
  };

  /* ══════════════════════════════ RENDER ═══════════════════════════ */
  return (
    <div className="space-y-6 max-w-full">
      {/* ─── PAGE HEADER ───────────────────────────────────────────── */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--foreground)]">
          Laporan & Sertifikat
        </h1>
        <p className="text-[13px] text-[var(--card-subtitle)] font-normal">
          Rekap capaian PKL dan penerbitan sertifikat
        </p>
      </div>

      {/* ─── SUMMARY CARDS ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Penempatan", value: totalStudents },
          { label: "Selesai", value: completedStudents },
          { label: "Sertifikat Terbit", value: issuedCertificates },
          { label: "Rata-rata Nilai", value: averageScore },
        ].map((card, idx) => (
          <div
            key={idx}
            className="p-4 sm:p-5 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] flex flex-col gap-1"
          >
            <span className="text-[11px] sm:text-xs font-semibold text-[var(--card-subtitle)] uppercase tracking-wide">
              {card.label}
            </span>
            <span className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
              {card.value}
            </span>
          </div>
        ))}
      </div>

      {/* ─── MAIN TABLE CARD ───────────────────────────────────────── */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] overflow-hidden shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
        {/* ── TOOLBAR ──────────────────────────────────────────────── */}
        <div className="p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Left: Search */}
          <div className="relative flex-1 max-w-[420px]">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--input-placeholder)]">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari siswa atau DUDI"
              className="w-full h-9 pl-10 pr-4 text-[13px] rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--input-text)] focus:outline-none focus:border-[var(--input-focus-border)] focus:ring-1 focus:ring-[var(--input-focus-border)] transition placeholder:text-[var(--input-placeholder)]"
            />
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportCSV}
              type="button"
              className="h-9 px-4 rounded-lg border border-[var(--input-border)] bg-[var(--card-bg)] text-[13px] font-semibold text-[var(--foreground)] hover:bg-[var(--surface-alt)] active:scale-[0.98] transition flex items-center justify-center cursor-pointer"
            >
              Export CSV
            </button>
          </div>
        </div>

        {/* ── Divider ──────────────────────────────────────────────── */}
        <div className="border-t border-[var(--table-border)]" />

        {/* ── TABLE ────────────────────────────────────────────────── */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-[var(--table-border)] text-[var(--card-subtitle)]">
                <th className="py-3.5 px-4 font-semibold text-xs whitespace-nowrap">Siswa</th>
                <th className="py-3.5 px-4 font-semibold text-xs whitespace-nowrap">DUDI</th>
                <th className="py-3.5 px-4 font-semibold text-xs whitespace-nowrap">Tahap</th>
                <th className="py-3.5 px-4 font-semibold text-xs whitespace-nowrap text-center">Rata-rata nilai</th>
                <th className="py-3.5 px-4 font-semibold text-xs whitespace-nowrap text-center">Sertifikat</th>
                <th className="py-3.5 px-4 font-semibold text-xs text-right whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--table-border)]">
              {paginatedStudents.map((student) => {
                const evaluation = evaluations.find((e) => e.studentId === student.id);
                const hasCertificate = !!evaluation?.certificateNumber;

                return (
                  <tr key={student.id} className="hover:bg-[var(--table-hover-bg)] transition-colors group">
                    <td className="py-4 px-4 font-medium text-[var(--table-text)] whitespace-nowrap">
                      {student.name}
                    </td>
                    <td className="py-4 px-4 text-[var(--foreground)] whitespace-nowrap">
                      {student.dudiName}
                    </td>
                    <td className="py-4 px-4 text-[var(--foreground)] whitespace-nowrap">
                      {student.stage}
                    </td>
                    <td className="py-4 px-4 text-[var(--foreground)] whitespace-nowrap text-center">
                      {evaluation ? evaluation.finalScore.toFixed(1) : "—"}
                    </td>
                    <td className="py-4 px-4 text-[var(--foreground)] whitespace-nowrap text-center">
                      {hasCertificate ? "Terbit" : "Belum terbit"}
                    </td>
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      {hasCertificate ? (
                        <button
                          type="button"
                          className="h-8 px-3 rounded-lg bg-[var(--surface-alt)] text-[var(--foreground)] text-[12px] font-semibold flex items-center gap-1.5 ml-auto opacity-70 cursor-not-allowed"
                          disabled
                        >
                          <FileCheck className="w-3.5 h-3.5" />
                          <span>Sudah Terbit</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => setPublishTarget(student)}
                          type="button"
                          className="h-8 px-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-[12px] font-semibold flex items-center gap-1.5 shadow-sm active:scale-[0.98] transition cursor-pointer ml-auto"
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>Terbitkan</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <GraduationCap className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                    <p className="text-sm font-semibold text-[var(--foreground)] mb-1">Data tidak ditemukan.</p>
                    <p className="text-xs text-[var(--card-subtitle)]">Coba ubah kata kunci pencarian.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── PAGINATION FOOTER ────────────────────────────────────── */}
        <div className="px-4 py-3 border-t border-[var(--table-border)] flex items-center justify-between text-[12px]">
          <span className="text-[var(--card-subtitle)]">
            Menampilkan {filteredStudents.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}–
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredStudents.length)} dari {filteredStudents.length} data
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              type="button"
              className="w-7 h-7 rounded-md border border-[var(--input-border)] flex items-center justify-center text-[var(--card-subtitle)] hover:text-[var(--foreground)] hover:bg-[var(--surface-alt)] transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-[var(--foreground)] font-medium min-w-[40px] text-center text-xs">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              type="button"
              className="w-7 h-7 rounded-md border border-[var(--input-border)] flex items-center justify-center text-[var(--card-subtitle)] hover:text-[var(--foreground)] hover:bg-[var(--surface-alt)] transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════ PUBLISH CONFIRMATION MODAL ═════════════════ */}
      {publishTarget && (
        <div className="fixed inset-0 z-50 bg-[var(--modal-overlay)] flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[var(--modal-bg)] border border-[var(--modal-border)] rounded-2xl p-6 shadow-2xl relative text-center">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-4">
              <Award className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            
            <h3 className="text-lg font-bold text-[var(--foreground)] mb-2">Terbitkan Sertifikat?</h3>
            <p className="text-[13px] text-[var(--card-subtitle)] mb-6 leading-relaxed">
              Anda akan menerbitkan sertifikat penyelesaian PKL untuk <strong>{publishTarget.name}</strong> dari <strong>{publishTarget.dudiName}</strong>. Tindakan ini tidak dapat dibatalkan.
            </p>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPublishTarget(null)}
                type="button"
                className="flex-1 h-10 rounded-lg border border-[var(--input-border)] text-[var(--foreground)] font-semibold hover:bg-[var(--surface-alt)] transition cursor-pointer text-sm"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmPublish}
                disabled={isSubmitting}
                type="button"
                className="flex-1 h-10 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
              >
                {isSubmitting ? "Memproses..." : "Terbitkan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
