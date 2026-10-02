"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Building2,
  BookCheck,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  ChevronRight,
  Sparkles,
  Phone,
  CheckSquare,
  Award,
  KanbanSquare,
  QrCode,
  Inbox
} from "lucide-react";
import { useInternTrackStore, Student } from "@/shared/store/useInternTrackStore";
import { StatusBadge } from "@/components/ui/StatusBadge";

export default function TeacherDashboardView() {
  const router = useRouter();
  const {
    students,
    dudiList,
    journals,
    userProfile,
    reviewJournal,
    addToast
  } = useInternTrackStore();

  const [reviewingJournalId, setReviewingJournalId] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState("");

  const teacherName = userProfile.fullName || "Guru Pembimbing";
  const teacherDept = userProfile.department || "Jurusan Bimbingan";

  // Calculations strictly from scoped data
  const totalStudents = students.length;
  const activeCount = students.filter((s) => s.stage === "Pelaksanaan (DUDI)" || s.status === "Aktif").length;
  const pendingJournals = journals.filter((j) => j.status === "Menunggu verifikasi");
  const attentionStudents = students.filter((s) => s.status === "Bermasalah" || s.attendanceRate < 85);

  const handleApproveJournal = async (journalId: string) => {
    try {
      await reviewJournal(journalId, "Terverifikasi", "Disetujui oleh pembimbing.", teacherName);
      addToast({
        type: "success",
        title: "Jurnal Disetujui",
        message: "Jurnal siswa berhasil diverifikasi.",
      });
    } catch {
      addToast({
        type: "error",
        title: "Gagal Verifikasi",
        message: "Terjadi kesalahan saat memverifikasi jurnal.",
      });
    }
  };

  const handleRevisiJournal = async (journalId: string) => {
    if (!feedbackText.trim()) return;
    try {
      await reviewJournal(journalId, "Perlu revisi", feedbackText, teacherName);
      setReviewingJournalId(null);
      setFeedbackText("");
      addToast({
        type: "info",
        title: "Catatan Revisi Terkirim",
        message: "Siswa diminta untuk merevisi jurnal.",
      });
    } catch {
      addToast({
        type: "error",
        title: "Gagal Mengirim Revisi",
        message: "Terjadi kesalahan saat mengirim revisi.",
      });
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* TEACHER HERO HEADER */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-xl sm:text-2xl font-bold shrink-0 shadow-inner">
              {teacherName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 uppercase tracking-wider">
                  Ruang Kerja Pembimbing
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-white border border-white/10">
                  {teacherDept}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{teacherName}</h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                Memantau {totalStudents} siswa bimbingan &bull; SMKN 3 Jakarta
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => router.push("/dashboard/kanban")}
              type="button"
              className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white text-xs font-semibold flex items-center gap-2 cursor-pointer transition shadow-sm"
            >
              <KanbanSquare className="w-4 h-4" />
              <span>Kanban Siswa</span>
            </button>
            <button
              onClick={() => router.push("/dashboard/penilaian")}
              type="button"
              className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 active:scale-[0.98] text-white border border-white/20 text-xs font-semibold flex items-center gap-2 cursor-pointer transition"
            >
              <Award className="w-4 h-4" />
              <span>Input Penilaian</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 SUMMARY METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Siswa Bimbingan */}
        <div className="p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-[var(--card-shadow)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-[var(--text-secondary)]">Siswa Bimbingan</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-3">
            <h2 className="text-3xl font-bold text-[var(--text-primary)] font-mono">{totalStudents}</h2>
            <p className="text-[11px] text-[var(--text-muted)] mt-1">Sesuai penugasan & jurusan</p>
          </div>
        </div>

        {/* Card 2: Sedang di Industri */}
        <div
          onClick={() => router.push("/dashboard/kanban")}
          className="p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-[var(--card-shadow)] flex flex-col justify-between cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition"
        >
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-[var(--text-secondary)]">Aktif di Industri</span>
            <Building2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-3">
            <h2 className="text-3xl font-bold text-[var(--text-primary)] font-mono">{activeCount}</h2>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Tahap Pelaksanaan (DUDI)</span>
            </p>
          </div>
        </div>

        {/* Card 3: Jurnal Menunggu Review */}
        <div
          onClick={() => router.push("/dashboard/jurnal")}
          className="p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-[var(--card-shadow)] flex flex-col justify-between cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition"
        >
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-[var(--text-secondary)]">Jurnal Perlu Review</span>
            <BookCheck className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-3">
            <h2 className="text-3xl font-bold text-[var(--text-primary)] font-mono">{pendingJournals.length}</h2>
            <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Menunggu persetujuan Anda</span>
            </p>
          </div>
        </div>

        {/* Card 4: Siswa Butuh Perhatian */}
        <div className="p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-[var(--card-shadow)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-[var(--text-secondary)]">Perlu Perhatian</span>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <div className="mt-3">
            <h2 className="text-3xl font-bold text-[var(--text-primary)] font-mono">{attentionStudents.length}</h2>
            <p className="text-[11px] text-red-600 dark:text-red-400 font-semibold mt-1">
              {attentionStudents.length > 0 ? "Presensi rendah / kendala" : "Semua siswa lancar"}
            </p>
          </div>
        </div>
      </div>

      {/* TWO COLUMN MAIN SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN (2 Cols): JURNAL MENUNGGU REVIEW & DAFTAR SISWA */}
        <div className="lg:col-span-2 space-y-6">
          {/* PENDING JOURNALS REVIEW PANEL */}
          <div className="p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-[var(--card-shadow)] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[var(--card-title)]">Jurnal Menunggu Review & Tindakan</h3>
                <p className="text-xs text-[var(--card-subtitle)]">
                  Jurnal harian yang diajukan siswa bimbingan Anda.
                </p>
              </div>
              <button
                onClick={() => router.push("/dashboard/jurnal")}
                type="button"
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Buka semua jurnal</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {pendingJournals.length === 0 ? (
              <div className="p-8 text-center bg-[var(--surface-alt)] rounded-xl border border-[var(--card-border)]">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs font-bold text-[var(--card-title)]">Semua Jurnal Telah Ditinjau</p>
                <p className="text-[11px] text-[var(--card-subtitle)] mt-0.5">
                  Tidak ada jurnal yang menunggu verifikasi saat ini.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingJournals.slice(0, 4).map((j) => (
                  <div
                    key={j.id}
                    className="p-4 rounded-xl bg-[var(--surface-alt)] border border-[var(--card-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-xs text-[var(--text-primary)]">{j.studentName}</span>
                        <span className="text-[10px] text-[var(--text-muted)] font-mono">{j.date}</span>
                        <span className="text-[10px] font-semibold text-[var(--brand-primary)] bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-md">
                          {j.dudiName}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-[var(--text-secondary)]">{j.title}</p>
                      <p className="text-[11px] text-[var(--text-muted)] line-clamp-2 mt-0.5">{j.description}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleApproveJournal(j.id)}
                        type="button"
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer transition shadow-xs"
                      >
                        Setujui
                      </button>
                      <button
                        onClick={() => setReviewingJournalId(reviewingJournalId === j.id ? null : j.id)}
                        type="button"
                        className="px-3 py-1.5 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] hover:bg-[var(--surface-alt)] text-[var(--text-primary)] text-xs font-semibold cursor-pointer transition"
                      >
                        Beri Catatan
                      </button>
                    </div>

                    {reviewingJournalId === j.id && (
                      <div className="w-full pt-3 mt-3 border-t border-[var(--card-border)] flex items-center gap-2">
                        <input
                          type="text"
                          value={feedbackText}
                          onChange={(e) => setFeedbackText(e.target.value)}
                          placeholder="Tuliskan catatan perbaikan untuk siswa..."
                          className="flex-1 token-input px-3 py-1.5 text-xs"
                        />
                        <button
                          onClick={() => handleRevisiJournal(j.id)}
                          type="button"
                          className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold cursor-pointer whitespace-nowrap"
                        >
                          Kirim Revisi
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* MY SUPERVISED STUDENTS TABLE */}
          <div className="p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-[var(--card-shadow)] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[var(--card-title)]">Daftar Siswa Bimbingan</h3>
                <p className="text-xs text-[var(--card-subtitle)]">
                  Progress dan presensi siswa dalam binaan Anda.
                </p>
              </div>
              <button
                onClick={() => router.push("/dashboard/kanban")}
                type="button"
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Lihat kanban</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs min-w-[650px]">
                <thead>
                  <tr className="border-b border-[var(--card-border)] bg-[var(--surface-alt)] text-[var(--card-subtitle)] font-semibold">
                    <th className="py-2.5 px-3">Nama Siswa</th>
                    <th className="py-2.5 px-3">Kelas / Jurusan</th>
                    <th className="py-2.5 px-3">Perusahaan DUDI</th>
                    <th className="py-2.5 px-3">Tahapan PKL</th>
                    <th className="py-2.5 px-3">Presensi</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--card-border)]">
                  {students.map((std) => (
                    <tr key={std.id} className="hover:bg-[var(--table-hover-bg)] transition-colors">
                      <td className="py-3 px-3 font-bold text-[var(--text-primary)]">
                        <p>{std.name}</p>
                        <p className="text-[10px] text-[var(--text-muted)] font-mono">{std.nisn}</p>
                      </td>
                      <td className="py-3 px-3 text-[var(--text-secondary)]">
                        <p className="font-semibold">{std.class}</p>
                        <p className="text-[10px] text-[var(--text-muted)]">{std.department}</p>
                      </td>
                      <td className="py-3 px-3 font-semibold text-[#1E3A8A] dark:text-blue-400">
                        {std.dudiName}
                      </td>
                      <td className="py-3 px-3 text-[var(--text-secondary)]">{std.stage}</td>
                      <td className="py-3 px-3 font-bold">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] ${
                            std.attendanceRate >= 85
                              ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                              : "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300"
                          }`}
                        >
                          {std.attendanceRate}%
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <StatusBadge status={std.status} />
                      </td>
                    </tr>
                  ))}
                  {students.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-[var(--text-muted)]">
                        <Inbox className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        Belum ada siswa yang ditugaskan ke bimbingan Anda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (1 Col): ATTENTION & DUDI PARTNERS */}
        <div className="space-y-6">
          {/* STUDENTS NEEDING ATTENTION */}
          <div className="p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-[var(--card-shadow)] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Perlu Perhatian ({attentionStudents.length})</span>
              </h3>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300">
                Prioritas
              </span>
            </div>

            <p className="text-xs text-[var(--card-subtitle)]">
              Siswa dengan kehadiran &lt;85% atau berstatus kendala.
            </p>

            {attentionStudents.length === 0 ? (
              <div className="py-5 text-center bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-[var(--card-border)]">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
                <p className="text-xs font-bold text-[var(--card-title)]">Semua siswa dalam kondisi baik</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {attentionStudents.map((std) => (
                  <div
                    key={std.id}
                    className="p-3 rounded-xl bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <h4 className="font-bold text-[var(--card-title)]">{std.name}</h4>
                      <p className="text-[11px] text-[var(--card-subtitle)]">{std.dudiName}</p>
                    </div>
                    <span className="text-[10px] font-bold text-red-600 dark:text-red-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md border border-red-200 dark:border-red-800">
                      {std.attendanceRate}% Presensi
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* DUDI PARTNERS LIST */}
          <div className="p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-[var(--card-shadow)] space-y-3">
            <h3 className="text-sm font-bold text-[var(--card-title)] flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-500" />
              <span>Mitra DUDI Terkait</span>
            </h3>
            <p className="text-xs text-[var(--card-subtitle)]">
              Perusahaan tempat siswa bimbingan Anda melaksanakan PKL.
            </p>

            {dudiList.length === 0 ? (
              <p className="text-xs text-[var(--card-subtitle)] text-center py-4">Belum ada mitra terdaftar.</p>
            ) : (
              <div className="space-y-2">
                {dudiList.map((d) => (
                  <div key={d.id} className="p-3 rounded-xl bg-[var(--surface-alt)] border border-[var(--card-border)] text-xs">
                    <p className="font-bold text-[var(--text-primary)]">{d.name}</p>
                    <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{d.address}</p>
                    <p className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold mt-1">
                      Pembimbing Industri: {d.industrySupervisor || "-"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
