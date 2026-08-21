"use client";

import { useState, useEffect } from "react";
import {
  Database,
  Plus,
  Edit2,
  Trash2,
  Users,
  Building2,
  AlertTriangle,
  Search,
  QrCode,
} from "lucide-react";
import FocusLock from "react-focus-lock";
import { useInternTrackStore, Student, Dudi } from "@/shared/store/useInternTrackStore";
import AddStudentModal from "../modals/AddStudentModal";
import AddDudiModal from "../modals/AddDudiModal";
import DudiQrModal from "../modals/DudiQrModal";

export default function DataMasterView() {
  const {
    students,
    dudiList,
    addStudent,
    updateStudent,
    deleteStudent,
    addDudi,
    updateDudi,
    deleteDudi,
    searchQuery,
    setSearchQuery,
  } = useInternTrackStore();

  const [activeMasterTab, setActiveMasterTab] = useState<"siswa" | "dudi">("siswa");

  // Student Modals
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [editStudentTarget, setEditStudentTarget] = useState<Student | null>(null);
  const [deleteStudentTarget, setDeleteStudentTarget] = useState<Student | null>(null);

  // DUDI Modals
  const [isAddDudiOpen, setIsAddDudiOpen] = useState(false);
  const [qrDudiTarget, setQrDudiTarget] = useState<Dudi | null>(null);

  /* ── Handle ESC Key ────────────────────────────────────────────── */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsAddStudentOpen(false);
        setEditStudentTarget(null);
        setDeleteStudentTarget(null);
        setIsAddDudiOpen(false);
        setQrDudiTarget(null);
      }
    };
    if (isAddStudentOpen || editStudentTarget || deleteStudentTarget || isAddDudiOpen || qrDudiTarget) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isAddStudentOpen, editStudentTarget, deleteStudentTarget, isAddDudiOpen, qrDudiTarget]);

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nisn.includes(searchQuery) ||
      s.dudiName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDudi = dudiList.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* HEADER & TABS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--card-title)] flex items-center gap-2">
            <Database className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>Manajemen Data Master (Admin)</span>
          </h1>
          <p className="text-xs sm:text-sm text-[var(--card-subtitle)] mt-1">
            Kelola data master siswa PKL, mitra perusahaan DUDI, dan pembimbing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeMasterTab === "siswa" ? (
            <button
              onClick={() => {
                setEditStudentTarget(null);
                setIsAddStudentOpen(true);
              }}
              type="button"
              className="py-2.5 px-4 rounded-xl bg-[#1E3A8A] hover:bg-[#122353] text-white text-xs font-semibold flex items-center gap-2 shadow-sm cursor-pointer transition"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Siswa Baru</span>
            </button>
          ) : (
            <button
              onClick={() => setIsAddDudiOpen(true)}
              type="button"
              className="py-2.5 px-4 rounded-xl bg-[#1E3A8A] hover:bg-[#122353] text-white text-xs font-semibold flex items-center gap-2 shadow-sm cursor-pointer transition"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Mitra DUDI</span>
            </button>
          )}
        </div>
      </div>

      {/* MASTER TAB SWITCHER */}
      <div className="bg-[var(--tab-bg)] p-1 rounded-full flex items-center max-w-md">
        <button
          onClick={() => setActiveMasterTab("siswa")}
          className={`flex-1 py-2 rounded-full text-xs font-semibold transition-all text-center cursor-pointer flex items-center justify-center gap-2 ${
            activeMasterTab === "siswa"
              ? "bg-[var(--tab-active-bg)] text-[var(--tab-active-text)] shadow-xs font-bold"
              : "text-[var(--tab-inactive-text)] hover:text-[var(--foreground)]"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Data Siswa ({students.length})</span>
        </button>
        <button
          onClick={() => setActiveMasterTab("dudi")}
          className={`flex-1 py-2 rounded-full text-xs font-semibold transition-all text-center cursor-pointer flex items-center justify-center gap-2 ${
            activeMasterTab === "dudi"
              ? "bg-[var(--tab-active-bg)] text-[var(--tab-active-text)] shadow-xs font-bold"
              : "text-[var(--tab-inactive-text)] hover:text-[var(--foreground)]"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Mitra DUDI ({dudiList.length})</span>
        </button>
      </div>

      {/* TAB CONTENT 1: SISWA TABLE */}
      {activeMasterTab === "siswa" && (
        <div className="p-4 sm:p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-[var(--card-shadow)]">
          {/* ── MOBILE CARD VIEW (SISWA) ─────────────────────────────── */}
          <div className="md:hidden space-y-4">
            {filteredStudents.map((std) => (
              <div key={std.id} className="p-4 rounded-xl border border-[var(--card-border)] bg-[var(--surface-alt)] shadow-sm space-y-3">
                <div className="flex items-center gap-3">
                  {std.avatar ? (
                    <img
                      src={std.avatar}
                      alt={std.name}
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm shrink-0">
                      {std.name.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-bold text-[var(--foreground)]">{std.name}</h3>
                    <p className="text-[11px] text-[var(--card-subtitle)]">{std.nisn} • {std.class}</p>
                  </div>
                </div>
                
                <div className="text-xs space-y-1 pt-2 border-t border-[var(--table-border)]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Perusahaan</span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">{std.dudiName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Pembimbing</span>
                    <span className="font-medium text-[var(--foreground)]">{std.schoolSupervisor}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--table-border)]">
                  <button
                    onClick={() => {
                      setEditStudentTarget(std);
                    }}
                    className="p-2 rounded-lg text-blue-600 border border-[var(--input-border)] hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteStudentTarget(std)}
                    className="p-2 rounded-lg text-red-600 border border-red-200 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {filteredStudents.length === 0 && (
              <div className="py-8 text-center text-[var(--card-subtitle)] text-sm">Belum ada data siswa.</div>
            )}
          </div>

          {/* ── DESKTOP TABLE (SISWA) ────────────────────────────────── */}
          <div className="hidden md:block overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs min-w-[720px]">
              <thead>
                <tr className="border-b border-[var(--card-border)] bg-[var(--table-header-bg)] text-[var(--card-subtitle)] font-semibold">
                  <th className="py-3 px-4 whitespace-nowrap">Nama & NISN</th>
                  <th className="py-3 px-4 whitespace-nowrap">Kelas & Jurusan</th>
                  <th className="py-3 px-4 whitespace-nowrap">Perusahaan DUDI</th>
                  <th className="py-3 px-4 whitespace-nowrap">Pembimbing Sekolah</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--card-border)] text-[var(--foreground)]">
                {filteredStudents.map((std) => (
                  <tr key={std.id} className="hover:bg-[var(--table-hover-bg)] transition-colors">
                    <td className="py-3.5 px-4 font-bold flex items-center gap-3 whitespace-nowrap">
                      {std.avatar ? (
                        <img
                          src={std.avatar}
                          alt={std.name}
                          className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm shrink-0 border border-slate-200 dark:border-slate-700">
                          {std.name.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-bold">{std.name}</p>
                        <p className="text-[10px] text-slate-600">{std.nisn}</p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <p className="font-semibold">{std.class}</p>
                      <p className="text-[10px] text-slate-600">{std.department}</p>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                      {std.dudiName}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-500 whitespace-nowrap">{std.schoolSupervisor}</td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-2">
                      <button
                        onClick={() => {
                          setEditStudentTarget(std);
                        }}
                        className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer"
                        title="Edit Data Siswa"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteStudentTarget(std)}
                        className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                        title="Hapus Siswa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-[var(--card-subtitle)] text-sm">
                      Belum ada data siswa.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: DUDI TABLE */}
      {activeMasterTab === "dudi" && (
        <div className="p-4 sm:p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-[var(--card-shadow)]">
          {/* ── MOBILE CARD VIEW (DUDI) ──────────────────────────────── */}
          <div className="md:hidden space-y-4">
            {filteredDudi.map((dudi) => (
              <div key={dudi.id} className="p-4 rounded-xl border border-[var(--card-border)] bg-[var(--surface-alt)] shadow-sm space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-[var(--foreground)]">{dudi.name}</h3>
                  <p className="text-[11px] text-[var(--card-subtitle)] mt-0.5">{dudi.address}</p>
                </div>
                
                <div className="text-xs space-y-1.5 pt-2 border-t border-[var(--table-border)]">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Pembimbing Industri</span>
                    <span className="font-semibold text-[var(--foreground)]">{dudi.industrySupervisor}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Kuota / Siswa Aktif</span>
                    <span className="font-mono bg-[var(--card-bg)] px-2 py-0.5 rounded border border-[var(--card-border)]">
                      {dudi.activeStudents} / {dudi.quota}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--table-border)]">
                  <button
                    onClick={() => setQrDudiTarget(dudi)}
                    className="p-2 rounded-lg text-emerald-600 border border-emerald-200 dark:border-emerald-900/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteDudi(dudi.id)}
                    className="p-2 rounded-lg text-red-600 border border-red-200 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {filteredDudi.length === 0 && (
              <div className="py-8 text-center text-[var(--card-subtitle)] text-sm">Belum ada data DUDI.</div>
            )}
          </div>

          {/* ── DESKTOP TABLE (DUDI) ─────────────────────────────────── */}
          <div className="hidden md:block overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs min-w-[650px]">
              <thead>
                <tr className="border-b border-[var(--card-border)] bg-[var(--table-header-bg)] text-[var(--card-subtitle)] font-semibold">
                  <th className="py-3 px-4 whitespace-nowrap">Nama Perusahaan</th>
                  <th className="py-3 px-4 whitespace-nowrap">Alamat DUDI</th>
                  <th className="py-3 px-4 whitespace-nowrap">Pembimbing Industri</th>
                  <th className="py-3 px-4 whitespace-nowrap">Kuota / Siswa Aktif</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--card-border)] text-[var(--foreground)]">
                {filteredDudi.map((dudi) => (
                  <tr key={dudi.id} className="hover:bg-[var(--table-hover-bg)] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-xs whitespace-nowrap">{dudi.name}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-500 whitespace-nowrap">{dudi.address}</td>
                    <td className="py-3.5 px-4 font-semibold whitespace-nowrap">{dudi.industrySupervisor}</td>
                    <td className="py-3.5 px-4 font-mono font-bold whitespace-nowrap">
                      {dudi.activeStudents} / {dudi.quota} Siswa
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-2">
                      <button
                        onClick={() => setQrDudiTarget(dudi)}
                        className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer"
                        title="Lihat QR Code"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteDudi(dudi.id)}
                        className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                        title="Hapus Perusahaan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredDudi.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-[var(--card-subtitle)] text-sm">
                      Belum ada data mitra DUDI.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD/EDIT STUDENT MODAL */}
      <AddStudentModal 
        isOpen={isAddStudentOpen || !!editStudentTarget} 
        onClose={() => {
          setIsAddStudentOpen(false);
          setEditStudentTarget(null);
        }} 
        editTarget={editStudentTarget} 
      />

      {/* CONFIRM DELETE MODAL */}
      {deleteStudentTarget && (
        <FocusLock>
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeleteStudentTarget(null);
          }}
        >
          <div className="w-full max-w-sm bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[var(--card-title)] mb-1">Konfirmasi Hapus Siswa</h3>
            <p className="text-xs text-[var(--card-subtitle)] mb-6">
              Apakah Anda yakin ingin menghapus <strong>{deleteStudentTarget.name}</strong>? Tindakan ini bersifat permanen.
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteStudentTarget(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteStudent(deleteStudentTarget.id);
                  setDeleteStudentTarget(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm"
              >
                Hapus Permanen
              </button>
            </div>
          </div>
        </div>
        </FocusLock>
      )}

      {/* ADD DUDI MODAL */}
      <AddDudiModal
        isOpen={isAddDudiOpen}
        onClose={() => setIsAddDudiOpen(false)}
      />
      {/* DUDI QR MODAL */}
      {qrDudiTarget && (
        <DudiQrModal
          isOpen={!!qrDudiTarget}
          onClose={() => setQrDudiTarget(null)}
          dudiName={qrDudiTarget.name}
          qrPayload={qrDudiTarget.qrCode}
        />
      )}
    </div>
  );
}
