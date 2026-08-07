"use client";

import { useState, useMemo } from "react";
import {
  Search,
  ChevronDown,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  BookOpen,
  Loader2
} from "lucide-react";
import { useInternTrackStore, JournalEntry } from "@/shared/store/useInternTrackStore";

const ITEMS_PER_PAGE = 10;
const STATUS_OPTIONS = ["Semua status", "Menunggu verifikasi", "Terverifikasi", "Perlu revisi"] as const;

export default function JurnalView() {
  const {
    journals,
    students,
    dudiList,
    addJournalEntry,
    updateJournalEntry,
    deleteJournalEntry,
    addToast,
    currentRole,
  } = useInternTrackStore();

  const isAdmin = currentRole === "Admin" || currentRole === "Guru Pembimbing" || currentRole === "Pembimbing Industri";

  /* ── Search & Filter ───────────────────────────────────────────── */
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Semua status");
  const [currentPage, setCurrentPage] = useState(1);

  /* ── Modal & Form State ────────────────────────────────────────── */
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<JournalEntry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<JournalEntry | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formStudentName, setFormStudentName] = useState("");
  const [formDudiName, setFormDudiName] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formWorkHours, setFormWorkHours] = useState(8);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formStatus, setFormStatus] = useState<JournalEntry["status"]>("Menunggu verifikasi");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  /* ── Derived Data ──────────────────────────────────────────────── */
  const filteredJournals = useMemo(() => {
    return journals.filter((rec) => {
      const q = searchQuery.toLowerCase();
      const matchSearch = rec.studentName.toLowerCase().includes(q) || rec.dudiName.toLowerCase().includes(q);
      const matchStatus = selectedStatus === "Semua status" || rec.status === selectedStatus;
      return matchSearch && matchStatus;
    });
  }, [journals, searchQuery, selectedStatus]);

  const totalPages = Math.max(1, Math.ceil(filteredJournals.length / ITEMS_PER_PAGE));
  const paginatedJournals = filteredJournals.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  /* ── Form Validation ───────────────────────────────────────────── */
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formStudentName) errors.studentName = "Nama siswa wajib diisi.";
    if (!formDudiName) errors.dudiName = "Perusahaan DUDI wajib diisi.";
    if (!formDate) errors.date = "Tanggal wajib diisi.";
    if (!formTitle) errors.title = "Judul wajib diisi.";
    if (!formDescription) errors.description = "Isi jurnal wajib diisi.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /* ── Add Modal ─────────────────────────────────────────────────── */
  const handleOpenAddModal = () => {
    const defaultStudent = students[0];
    setFormStudentName(defaultStudent?.name || "");
    setFormDudiName(dudiList.find((d) => d.name === defaultStudent?.dudiName)?.name || dudiList[0]?.name || "");
    setFormDate(new Date().toISOString().split("T")[0]);
    setFormWorkHours(8);
    setFormTitle("");
    setFormDescription("");
    setFormStatus("Menunggu verifikasi");
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const student = students.find((s) => s.name === formStudentName);
      addJournalEntry({
        studentId: student?.id || `std-${Date.now()}`,
        studentName: formStudentName,
        dudiName: formDudiName,
        date: formDate,
        workHours: formWorkHours,
        title: formTitle,
        description: formDescription,
      });
      setIsSubmitting(false);
      setIsAddModalOpen(false);
    }, 600);
  };

  /* ── Edit Modal ────────────────────────────────────────────────── */
  const handleOpenEditModal = (record: JournalEntry) => {
    setEditingRecord(record);
    setFormStudentName(record.studentName);
    setFormDudiName(record.dudiName);
    setFormDate(record.date);
    setFormWorkHours(record.workHours);
    setFormTitle(record.title);
    setFormDescription(record.description);
    setFormStatus(record.status);
    setFormErrors({});
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord || !validateForm()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      updateJournalEntry(editingRecord.id, {
        studentName: formStudentName,
        dudiName: formDudiName,
        date: formDate,
        workHours: formWorkHours,
        title: formTitle,
        description: formDescription,
        status: formStatus,
      });
      setIsSubmitting(false);
      setEditingRecord(null);
    }, 600);
  };

  /* ── Delete Action ─────────────────────────────────────────────── */
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    deleteJournalEntry(deleteTarget.id);
    setDeleteTarget(null);
  };

  /* ── Export CSV ────────────────────────────────────────────────── */
  const handleExportCSV = () => {
    const headers = ["Siswa", "Perusahaan DUDI", "Tanggal", "Durasi (Jam)", "Judul", "Isi", "Status"];
    const rows = filteredJournals.map((j) => [
      j.studentName,
      j.dudiName,
      j.date,
      j.workHours.toString(),
      j.title,
      j.description,
      j.status,
    ]);

    const csvContent = [headers.join(","), ...rows.map((row) => row.map((v) => `"${v}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `jurnal-interntrack-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    addToast({ type: "success", title: "Export Berhasil", message: "Data jurnal telah diunduh sebagai CSV." });
  };

  /* ══════════════════════════════ RENDER ═══════════════════════════ */
  return (
    <div className="space-y-6 max-w-full">
      {/* ─── PAGE HEADER ───────────────────────────────────────────── */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--foreground)]">Jurnal Harian</h1>
        <p className="text-[13px] text-[var(--card-subtitle)] font-normal">
          Catatan kegiatan harian siswa dan verifikasi pembimbing
        </p>
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
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Cari siswa atau DUDI"
              className="w-full h-9 pl-10 pr-4 text-[13px] rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--input-text)] focus:outline-none focus:border-[var(--input-focus-border)] focus:ring-1 focus:ring-[var(--input-focus-border)] transition placeholder:text-[var(--input-placeholder)]"
            />
          </div>

          {/* Right: Filters + Actions */}
          <div className="flex items-center gap-2.5 flex-wrap lg:flex-nowrap">
            {/* Status Filter */}
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
                className="appearance-none h-9 pl-3 pr-8 text-[13px] font-medium rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--input-text)] focus:outline-none focus:border-[var(--input-focus-border)] focus:ring-1 focus:ring-[var(--input-focus-border)] cursor-pointer min-w-[150px]"
              >
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[var(--input-placeholder)] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Export CSV */}
            <button
              onClick={handleExportCSV}
              type="button"
              className="h-9 px-3.5 rounded-lg border border-[var(--input-border)] bg-[var(--card-bg)] text-[13px] font-semibold text-[var(--foreground)] hover:bg-[var(--surface-alt)] active:scale-[0.98] transition flex items-center justify-center cursor-pointer"
            >
              Export CSV
            </button>

            {/* + Catat absensi (Matches Figma label exactly) */}
            <button
              onClick={handleOpenAddModal}
              type="button"
              className="h-9 px-4 rounded-lg bg-[var(--btn-primary-bg)] hover:bg-[var(--btn-primary-hover)] text-[var(--btn-primary-text)] text-[13px] font-semibold flex items-center gap-1.5 shadow-sm active:scale-[0.98] transition cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Catat absensi</span>
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
                <th className="py-3.5 px-4 font-semibold text-xs whitespace-nowrap">Tanggal</th>
                <th className="py-3.5 px-4 font-semibold text-xs whitespace-nowrap">Judul</th>
                <th className="py-3.5 px-4 font-semibold text-xs min-w-[250px]">Isi</th>
                <th className="py-3.5 px-4 font-semibold text-xs whitespace-nowrap">Status</th>
                <th className="py-3.5 px-4 font-semibold text-xs text-right whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--table-border)]">
              {paginatedJournals.map((rec) => (
                <tr key={rec.id} className="hover:bg-[var(--table-hover-bg)] transition-colors group">
                  <td className="py-4 px-4 font-medium text-[var(--table-text)] whitespace-nowrap">{rec.studentName}</td>
                  <td className="py-4 px-4 text-[var(--foreground)] whitespace-nowrap">{rec.date}</td>
                  <td className="py-4 px-4 text-[var(--foreground)]">{rec.title}</td>
                  <td className="py-4 px-4 text-[var(--foreground)] leading-relaxed">
                    {rec.description}
                  </td>
                  <td className="py-4 px-4 text-[var(--foreground)] whitespace-nowrap">{rec.status}</td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => handleOpenEditModal(rec)}
                        type="button"
                        className="text-[var(--card-subtitle)] hover:text-[var(--foreground)] transition cursor-pointer"
                        title="Edit Jurnal"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(rec)}
                        type="button"
                        className="text-red-500 hover:text-red-600 transition cursor-pointer"
                        title="Hapus Jurnal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredJournals.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <BookOpen className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                    <p className="text-sm font-semibold text-[var(--foreground)] mb-1">Belum ada data jurnal.</p>
                    <p className="text-xs text-[var(--card-subtitle)]">Data jurnal kegiatan siswa akan muncul di sini.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── PAGINATION FOOTER ────────────────────────────────────── */}
        <div className="px-4 py-3 border-t border-[var(--table-border)] flex items-center justify-between text-[12px]">
          <span className="text-[var(--card-subtitle)]">
            Menampilkan {filteredJournals.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredJournals.length)} dari {filteredJournals.length} data
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

      {/* ═══════════════ ADD MODAL ══════════════════════════════════ */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-[var(--modal-overlay)] flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[var(--modal-bg)] border border-[var(--modal-border)] rounded-2xl p-6 shadow-2xl relative">
            <button onClick={() => setIsAddModalOpen(false)} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-[var(--surface-alt)] text-[var(--card-subtitle)] cursor-pointer transition"><X className="w-4 h-4" /></button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[var(--badge-info-bg)] flex items-center justify-center">
                <Plus className="w-5 h-5 text-[var(--badge-info-text)]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--foreground)]">Tambah Jurnal</h3>
                <p className="text-xs text-[var(--card-subtitle)]">Catat kegiatan harian siswa.</p>
              </div>
            </div>

            <form onSubmit={handleSaveAdd} className="space-y-4 text-[13px]">
              <div>
                <label className="block font-semibold mb-1.5 text-[var(--foreground)]">Nama Siswa</label>
                <select value={formStudentName} onChange={(e) => setFormStudentName(e.target.value)} className="w-full h-10 token-input px-3 text-sm">
                  {students.map((s) => <option key={s.id} value={s.name}>{s.name} ({s.class})</option>)}
                </select>
                {formErrors.studentName && <p className="text-red-500 text-xs mt-1">{formErrors.studentName}</p>}
              </div>

              <div>
                <label className="block font-semibold mb-1.5 text-[var(--foreground)]">Perusahaan DUDI</label>
                <select value={formDudiName} onChange={(e) => setFormDudiName(e.target.value)} className="w-full h-10 token-input px-3 text-sm">
                  {dudiList.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
                </select>
                {formErrors.dudiName && <p className="text-red-500 text-xs mt-1">{formErrors.dudiName}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1.5 text-[var(--foreground)]">Tanggal</label>
                  <input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} className="w-full h-10 token-input px-3 text-sm" />
                  {formErrors.date && <p className="text-red-500 text-xs mt-1">{formErrors.date}</p>}
                </div>
                <div>
                  <label className="block font-semibold mb-1.5 text-[var(--foreground)]">Durasi (Jam)</label>
                  <input type="number" min="1" max="12" value={formWorkHours} onChange={(e) => setFormWorkHours(Number(e.target.value))} className="w-full h-10 token-input px-3 text-sm" />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1.5 text-[var(--foreground)]">Judul Kegiatan</label>
                <input type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="Contoh: Menyusun UI komponen" className="w-full h-10 token-input px-3 text-sm" />
                {formErrors.title && <p className="text-red-500 text-xs mt-1">{formErrors.title}</p>}
              </div>

              <div>
                <label className="block font-semibold mb-1.5 text-[var(--foreground)]">Isi Kegiatan</label>
                <textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} rows={3} placeholder="Deskripsikan pekerjaan yang dilakukan..." className="w-full token-input px-3 py-2.5 text-sm resize-none" />
                {formErrors.description && <p className="text-red-500 text-xs mt-1">{formErrors.description}</p>}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 h-10 rounded-lg border border-[var(--input-border)] text-[var(--foreground)] font-semibold hover:bg-[var(--surface-alt)] transition cursor-pointer text-sm">
                  Batal
                </button>
                <button type="submit" disabled={isSubmitting} className="flex-1 h-10 rounded-lg bg-[var(--btn-primary-bg)] hover:bg-[var(--btn-primary-hover)] text-white font-semibold shadow-sm transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2">
                  {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : "Simpan Jurnal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════ EDIT MODAL ═════════════════════════════════ */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 bg-[var(--modal-overlay)] flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[var(--modal-bg)] border border-[var(--modal-border)] rounded-2xl p-6 shadow-2xl relative">
            <button onClick={() => setEditingRecord(null)} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-[var(--surface-alt)] text-[var(--card-subtitle)] cursor-pointer transition"><X className="w-4 h-4" /></button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[var(--badge-warning-bg)] flex items-center justify-center">
                <Pencil className="w-5 h-5 text-[var(--badge-warning-text)]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--foreground)]">Edit Jurnal</h3>
                <p className="text-xs text-[var(--card-subtitle)]">Ubah data jurnal {editingRecord.studentName}.</p>
              </div>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-[13px]">
              <div>
                <label className="block font-semibold mb-1.5 text-[var(--foreground)]">Nama Siswa</label>
                <input type="text" value={formStudentName} onChange={(e) => setFormStudentName(e.target.value)} className="w-full h-10 token-input px-3 text-sm" />
              </div>

              <div>
                <label className="block font-semibold mb-1.5 text-[var(--foreground)]">Perusahaan DUDI</label>
                <input type="text" value={formDudiName} onChange={(e) => setFormDudiName(e.target.value)} className="w-full h-10 token-input px-3 text-sm" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1.5 text-[var(--foreground)]">Tanggal</label>
                  <input type="text" value={formDate} onChange={(e) => setFormDate(e.target.value)} className="w-full h-10 token-input px-3 text-sm" />
                </div>
                <div>
                  <label className="block font-semibold mb-1.5 text-[var(--foreground)]">Durasi (Jam)</label>
                  <input type="number" min="1" max="12" value={formWorkHours} onChange={(e) => setFormWorkHours(Number(e.target.value))} className="w-full h-10 token-input px-3 text-sm" />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1.5 text-[var(--foreground)]">Judul Kegiatan</label>
                <input type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} className="w-full h-10 token-input px-3 text-sm" />
              </div>

              <div>
                <label className="block font-semibold mb-1.5 text-[var(--foreground)]">Isi Kegiatan</label>
                <textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} rows={3} className="w-full token-input px-3 py-2.5 text-sm resize-none" />
              </div>
              
              {isAdmin && (
                <div>
                  <label className="block font-semibold mb-1.5 text-[var(--foreground)]">Status Verifikasi</label>
                  <select value={formStatus} onChange={(e) => setFormStatus(e.target.value as JournalEntry["status"])} className="w-full h-10 token-input px-3 text-sm font-semibold">
                    <option value="Menunggu verifikasi">Menunggu verifikasi</option>
                    <option value="Terverifikasi">Terverifikasi</option>
                    <option value="Perlu revisi">Perlu revisi</option>
                  </select>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button type="button" onClick={() => setEditingRecord(null)} className="flex-1 h-10 rounded-lg border border-[var(--input-border)] text-[var(--foreground)] font-semibold hover:bg-[var(--surface-alt)] transition cursor-pointer text-sm">
                  Batal
                </button>
                <button type="submit" disabled={isSubmitting} className="flex-1 h-10 rounded-lg bg-[var(--btn-primary-bg)] hover:bg-[var(--btn-primary-hover)] text-white font-semibold shadow-sm transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2">
                  {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════ DELETE CONFIRMATION ════════════════════════ */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-[var(--modal-overlay)] flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[var(--modal-bg)] border border-[var(--modal-border)] rounded-2xl p-6 shadow-2xl text-center">
            <h3 className="text-base font-bold text-[var(--foreground)] mb-1">Hapus Jurnal?</h3>
            <p className="text-sm text-[var(--card-subtitle)] mb-5">
              Jurnal <strong>{deleteTarget.title}</strong> akan dihapus secara permanen.
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
      )}
    </div>
  );
}
