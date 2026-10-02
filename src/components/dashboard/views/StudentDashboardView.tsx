"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Building2,
  GraduationCap,
  Award,
  ArrowRight,
  Plus,
  FileText,
  User,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  QrCode,
  AlertCircle
} from "lucide-react";
import { useInternTrackStore, KanbanStage } from "@/shared/store/useInternTrackStore";
import { StatusBadge } from "@/components/ui/StatusBadge";
import AddJournalModal from "@/components/dashboard/modals/AddJournalModal";

export default function StudentDashboardView() {
  const router = useRouter();
  const {
    students,
    dudiList,
    attendanceRecords,
    journals,
    evaluations,
    userProfile,
  } = useInternTrackStore();

  const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);

  // Student specific record (scoped to this student from DB)
  const currentStudent = students[0];
  const currentEvaluation = evaluations[0];
  const currentDudi = dudiList.find((d) => d.id === currentStudent?.dudiName || d.name === currentStudent?.dudiName) || dudiList[0];

  const studentName = currentStudent?.name || userProfile.fullName || "Siswa";
  const studentDept = currentStudent?.department || userProfile.department || "Jurusan Belum Ditentukan";
  const studentClass = currentStudent?.class || "XII";
  const studentNisn = currentStudent?.nisn || "-";
  const studentStage: KanbanStage = currentStudent?.stage || "Pendaftaran & Pembekalan";
  const studentStatus = currentStudent?.status || "Aktif";
  const attendanceRate = currentStudent?.attendanceRate ?? 100;
  const journalCount = journals.length;
  const pendingJournalsCount = journals.filter((j) => j.status === "Menunggu verifikasi").length;
  const verifiedJournalsCount = journals.filter((j) => j.status === "Terverifikasi").length;

  const stages: { label: KanbanStage; number: number; desc: string }[] = [
    { label: "Pendaftaran & Pembekalan", number: 1, desc: "Persiapan & administrasi" },
    { label: "Pelaksanaan (DUDI)", number: 2, desc: "Magang di industri mitra" },
    { label: "Penilaian & Review", number: 3, desc: "Evaluasi kinerja & kompetensi" },
    { label: "Selesai & Sertifikasi", number: 4, desc: "Penerbitan sertifikat resmi" },
  ];

  const currentStageIndex = stages.findIndex((s) => s.label === studentStage);
  const activeStageIdx = currentStageIndex >= 0 ? currentStageIndex : 0;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* STUDENT HERO HEADER */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-950 text-white shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-xl sm:text-2xl font-bold shrink-0 shadow-inner">
              {studentName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/30 text-blue-200 border border-blue-400/30 uppercase tracking-wider">
                  Dashboard Siswa
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-white border border-white/10">
                  {studentDept}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{studentName}</h1>
              <p className="text-xs sm:text-sm text-blue-200/80 mt-0.5">
                NISN: {studentNisn} &bull; Kelas: {studentClass} &bull; Status: {studentStatus}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsJournalModalOpen(true)}
              type="button"
              className="py-2.5 px-4 rounded-xl bg-blue-500 hover:bg-blue-600 active:scale-[0.98] text-white text-xs font-semibold flex items-center gap-2 cursor-pointer transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Isi Jurnal Hari Ini</span>
            </button>
            <button
              onClick={() => router.push("/dashboard/absensi")}
              type="button"
              className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 active:scale-[0.98] text-white border border-white/20 text-xs font-semibold flex items-center gap-2 cursor-pointer transition"
            >
              <QrCode className="w-4 h-4" />
              <span>Presensi</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 SUMMARY METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tahapan PKL */}
        <div className="p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-[var(--card-shadow)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-[var(--text-secondary)]">Tahapan PKL</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-3">
            <h2 className="text-lg font-bold text-[var(--text-primary)] leading-tight">{studentStage}</h2>
            <p className="text-[11px] text-[var(--text-muted)] mt-1">Tahap {activeStageIdx + 1} dari 4</p>
          </div>
        </div>

        {/* Card 2: Kehadiran Saya */}
        <div
          onClick={() => router.push("/dashboard/absensi")}
          className="p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-[var(--card-shadow)] flex flex-col justify-between cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition"
        >
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-[var(--text-secondary)]">Tingkat Kehadiran</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-3">
            <h2 className="text-3xl font-bold text-[var(--text-primary)] font-mono">{attendanceRate}%</h2>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-1">
              <span>{attendanceRecords.length} Hari tercatat</span>
            </p>
          </div>
        </div>

        {/* Card 3: Jurnal Harian */}
        <div
          onClick={() => router.push("/dashboard/jurnal")}
          className="p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-[var(--card-shadow)] flex flex-col justify-between cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition"
        >
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-[var(--text-secondary)]">Jurnal Terisi</span>
            <BookOpen className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-3">
            <h2 className="text-3xl font-bold text-[var(--text-primary)] font-mono">{journalCount}</h2>
            <p className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{pendingJournalsCount} menunggu verifikasi</span>
            </p>
          </div>
        </div>

        {/* Card 4: Nilai Akhir & Sertifikat */}
        <div
          onClick={() => router.push("/dashboard/penilaian")}
          className="p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-[var(--card-shadow)] flex flex-col justify-between cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition"
        >
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-[var(--text-secondary)]">Nilai & Sertifikat</span>
            <Award className="w-4 h-4 text-purple-500" />
          </div>
          <div className="mt-3">
            <h2 className="text-3xl font-bold text-[var(--text-primary)] font-mono">
              {currentEvaluation ? `${currentEvaluation.finalScore} (${currentEvaluation.grade})` : "Belum Ada"}
            </h2>
            <p className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold mt-1">
              {currentEvaluation?.certificateNumber ? "Sertifikat Terbit" : "Evaluasi Berjalan"}
            </p>
          </div>
        </div>
      </div>

      {/* STAGES PROGRESS STEPPER */}
      <div className="p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-[var(--card-shadow)] space-y-4">
        <div>
          <h3 className="text-base font-bold text-[var(--card-title)]">Progres Perjalanan PKL</h3>
          <p className="text-xs text-[var(--card-subtitle)] mt-0.5">
            Tahapan resmi pelaksanaan praktik kerja lapangan di SMK.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {stages.map((stg, idx) => {
            const isDone = idx < activeStageIdx;
            const isCurrent = idx === activeStageIdx;
            return (
              <div
                key={stg.label}
                className={`p-4 rounded-xl border transition-all ${
                  isCurrent
                    ? "bg-blue-50/70 dark:bg-blue-950/30 border-blue-500 dark:border-blue-500 shadow-xs"
                    : isDone
                    ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800"
                    : "bg-[var(--surface-alt)] border-[var(--card-border)] opacity-60"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isDone
                        ? "bg-emerald-600 text-white"
                        : isCurrent
                        ? "bg-blue-600 text-white"
                        : "bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : stg.number}
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${
                      isCurrent
                        ? "text-blue-700 dark:text-blue-300"
                        : isDone
                        ? "text-emerald-700 dark:text-emerald-300"
                        : "text-[var(--text-muted)]"
                    }`}
                  >
                    {isDone ? "Selesai" : isCurrent ? "Sedang Berjalan" : "Akan Datang"}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-[var(--card-title)]">{stg.label}</h4>
                <p className="text-[11px] text-[var(--card-subtitle)] mt-1">{stg.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* TWO COLUMN SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN (2 Cols): DUDI INFO & RECENT JOURNALS */}
        <div className="lg:col-span-2 space-y-6">
          {/* DUDI PLACEMENT INFORMATION */}
          <div className="p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-[var(--card-shadow)] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--card-title)]">Informasi Tempat PKL (DUDI)</h3>
                  <p className="text-xs text-[var(--card-subtitle)]">Data perusahaan dan pembimbing Anda</p>
                </div>
              </div>
            </div>

            {currentStudent?.dudiName && currentStudent?.dudiName !== "-" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-[var(--surface-alt)] border border-[var(--card-border)] space-y-2">
                  <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Perusahaan Mitra</span>
                  <p className="text-sm font-bold text-[var(--text-primary)]">{currentStudent.dudiName}</p>
                  {currentDudi?.address && (
                    <p className="text-xs text-[var(--text-muted)] flex items-start gap-1.5 pt-1">
                      <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-500 mt-0.5" />
                      <span>{currentDudi.address}</span>
                    </p>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-[var(--surface-alt)] border border-[var(--card-border)] space-y-2">
                  <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Pembimbing</span>
                  <div>
                    <p className="text-xs font-semibold text-[var(--text-primary)]">
                      Industri: <span className="font-normal text-[var(--text-secondary)]">{currentStudent.industrySupervisor || "-"}</span>
                    </p>
                    <p className="text-xs font-semibold text-[var(--text-primary)] mt-1">
                      Sekolah: <span className="font-normal text-[var(--text-secondary)]">{currentStudent.schoolSupervisor || "-"}</span>
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center bg-[var(--surface-alt)] rounded-xl border border-[var(--card-border)]">
                <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                <h4 className="text-xs font-bold text-[var(--card-title)]">Belum Ditempatkan di Mitra DUDI</h4>
                <p className="text-[11px] text-[var(--card-subtitle)] mt-1 max-w-sm mx-auto">
                  Penempatan Anda sedang dalam proses oleh Koordinator PKL. Anda akan diberitahu setelah penempatan selesai.
                </p>
              </div>
            )}
          </div>

          {/* MY RECENT JOURNALS */}
          <div className="p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-[var(--card-shadow)] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[var(--card-title)]">Jurnal Harian Terbaru Saya</h3>
                <p className="text-xs text-[var(--card-subtitle)]">Aktivitas pembelajaran dan pekerjaan yang Anda catat</p>
              </div>
              <button
                onClick={() => router.push("/dashboard/jurnal")}
                type="button"
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Lihat semua</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {journals.length === 0 ? (
              <div className="p-8 text-center bg-[var(--surface-alt)] rounded-xl border border-[var(--card-border)]">
                <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-[var(--card-title)]">Belum ada jurnal yang diisi</p>
                <p className="text-[11px] text-[var(--card-subtitle)] mt-0.5 mb-3">
                  Mulai catat kegiatan harian Anda selama PKL agar dapat direview oleh guru pembimbing.
                </p>
                <button
                  onClick={() => setIsJournalModalOpen(true)}
                  type="button"
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer transition shadow-xs inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Isi Jurnal Pertama</span>
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-xs min-w-[500px]">
                  <thead>
                    <tr className="border-b border-[var(--card-border)] bg-[var(--surface-alt)] text-[var(--card-subtitle)] font-semibold">
                      <th className="py-2.5 px-3">Tanggal</th>
                      <th className="py-2.5 px-3">Aktivitas</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Catatan Pembimbing</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--card-border)]">
                    {journals.slice(0, 5).map((j) => (
                      <tr key={j.id} className="hover:bg-[var(--table-hover-bg)] transition-colors">
                        <td className="py-3 px-3 font-mono text-[var(--text-muted)] whitespace-nowrap">{j.date}</td>
                        <td className="py-3 px-3 font-medium">
                          <p className="font-bold text-[var(--text-primary)]">{j.title}</p>
                          <p className="text-[11px] text-[var(--text-muted)] line-clamp-1">{j.description}</p>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              j.status === "Terverifikasi"
                                ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                                : j.status === "Perlu revisi"
                                ? "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300"
                                : "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
                            }`}
                          >
                            {j.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-[11px] text-[var(--text-muted)] italic">
                          {j.feedback || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN (1 Col): ATTENDANCE SUMMARY & PROFILE */}
        <div className="space-y-6">
          {/* RECENT ATTENDANCE */}
          <div className="p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-[var(--card-shadow)] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--card-title)] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span>Presensi Terakhir</span>
              </h3>
              <button
                onClick={() => router.push("/dashboard/absensi")}
                type="button"
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                Lihat semua
              </button>
            </div>

            {attendanceRecords.length === 0 ? (
              <p className="text-xs text-[var(--card-subtitle)] py-4 text-center">Belum ada riwayat presensi tercatat.</p>
            ) : (
              <div className="space-y-2.5">
                {attendanceRecords.slice(0, 4).map((att) => (
                  <div
                    key={att.id}
                    className="p-3 rounded-xl bg-[var(--surface-alt)] border border-[var(--card-border)] flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <p className="font-semibold text-[var(--text-primary)]">{att.date || "Hari Ini"}</p>
                      <p className="text-[11px] text-[var(--text-muted)]">
                        {att.timeIn ? `Masuk: ${att.timeIn}` : "Belum absen"} {att.timeOut ? `| Pulang: ${att.timeOut}` : ""}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        att.status === "Hadir"
                          ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                          : "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
                      }`}
                    >
                      {att.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* MY PROFILE INFO CARD */}
          <div className="p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-[var(--card-shadow)] space-y-3">
            <h3 className="text-sm font-bold text-[var(--card-title)] flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-500" />
              <span>Data Akun Siswa</span>
            </h3>

            <div className="space-y-2 text-xs divide-y divide-[var(--card-border)]">
              <div className="pt-2 flex justify-between">
                <span className="text-[var(--text-muted)]">NISN</span>
                <span className="font-mono font-semibold text-[var(--text-primary)]">{studentNisn}</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-[var(--text-muted)]">Jurusan</span>
                <span className="font-semibold text-[var(--text-primary)] text-right">{studentDept}</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-[var(--text-muted)]">Sekolah</span>
                <span className="font-semibold text-[var(--text-primary)]">SMKN 3 Jakarta</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-[var(--text-muted)]">WhatsApp</span>
                <span className="font-semibold text-[var(--text-primary)]">{userProfile.whatsapp || currentStudent?.whatsapp || "-"}</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-[var(--text-muted)]">Email</span>
                <span className="font-semibold text-[var(--text-primary)] truncate max-w-[180px]">{userProfile.email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ADD JOURNAL MODAL */}
      <AddJournalModal
        isOpen={isJournalModalOpen}
        onClose={() => setIsJournalModalOpen(false)}
      />
    </div>
  );
}
