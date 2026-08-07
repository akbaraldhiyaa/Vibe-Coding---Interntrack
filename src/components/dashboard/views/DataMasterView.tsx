"use client";

import { useState } from "react";
import {
  Database,
  Plus,
  Edit2,
  Trash2,
  Users,
  Building2,
  X,
  AlertTriangle,
  Search,
} from "lucide-react";
import { useInternTrackStore, Student, Dudi } from "@/shared/store/useInternTrackStore";

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

  // Form states for Student
  const [stdName, setStdName] = useState("");
  const [stdNisn, setStdNisn] = useState("");
  const [stdClass, setStdClass] = useState("XII RPL 1");
  const [stdDept, setStdDept] = useState("Rekayasa Perangkat Lunak");
  const [stdDudi, setStdDudi] = useState("PT Technology Nusantara");

  // DUDI Modals
  const [isAddDudiOpen, setIsAddDudiOpen] = useState(false);
  const [dudiName, setDudiName] = useState("");
  const [dudiAddress, setDudiAddress] = useState("");
  const [dudiSupervisor, setDudiSupervisor] = useState("");
  const [dudiQuota, setDudiQuota] = useState(5);

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

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (editStudentTarget) {
      updateStudent(editStudentTarget.id, {
        name: stdName,
        nisn: stdNisn,
        class: stdClass,
        department: stdDept,
        dudiName: stdDudi,
      });
      setEditStudentTarget(null);
    } else {
      addStudent({
        nisn: stdNisn,
        name: stdName,
        class: stdClass,
        department: stdDept,
        dudiName: stdDudi,
        schoolSupervisor: "Bpk. Hendra Wijaya, S.Kom",
        industrySupervisor: "Ibu Maya Kartika",
        stage: "Pelaksanaan (DUDI)",
        status: "Aktif",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
        whatsapp: "081234567890",
        email: `${stdName.toLowerCase().replace(/\s+/g, ".")}@smkn3.sch.id`,
        attendanceRate: 100,
        journalCount: 0,
      });
      setIsAddStudentOpen(false);
    }
    setStdName("");
    setStdNisn("");
  };

  const handleSaveDudi = (e: React.FormEvent) => {
    e.preventDefault();
    addDudi({
      name: dudiName,
      address: dudiAddress,
      industrySupervisor: dudiSupervisor,
      quota: dudiQuota,
      activeStudents: 0,
      qrCode: `QR-${dudiName.replace(/\s+/g, "-").toUpperCase()}-2026`,
    });
    setIsAddDudiOpen(false);
    setDudiName("");
    setDudiAddress("");
    setDudiSupervisor("");
  };

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
                setStdName("");
                setStdNisn("");
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
        <div className="p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-[var(--card-shadow)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--card-border)] bg-[var(--table-header-bg)] text-[var(--card-subtitle)] font-semibold">
                  <th className="py-3 px-4">Nama & NISN</th>
                  <th className="py-3 px-4">Kelas & Jurusan</th>
                  <th className="py-3 px-4">Perusahaan DUDI</th>
                  <th className="py-3 px-4">Pembimbing Sekolah</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--card-border)] text-[var(--foreground)]">
                {filteredStudents.map((std) => (
                  <tr key={std.id} className="hover:bg-[var(--table-hover-bg)] transition-colors">
                    <td className="py-3.5 px-4 font-bold flex items-center gap-3">
                      <img
                        src={std.avatar}
                        alt={std.name}
                        className="w-8 h-8 rounded-full object-cover shrink-0"
                      />
                      <div>
                        <p className="text-xs font-bold">{std.name}</p>
                        <p className="text-[10px] text-slate-600">{std.nisn}</p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold">{std.class}</p>
                      <p className="text-[10px] text-slate-600">{std.department}</p>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-blue-600 dark:text-blue-400">
                      {std.dudiName}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-500">{std.schoolSupervisor}</td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setEditStudentTarget(std);
                          setStdName(std.name);
                          setStdNisn(std.nisn);
                          setStdClass(std.class);
                          setStdDept(std.department);
                          setStdDudi(std.dudiName);
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
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: DUDI TABLE */}
      {activeMasterTab === "dudi" && (
        <div className="p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-[var(--card-shadow)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--card-border)] bg-[var(--table-header-bg)] text-[var(--card-subtitle)] font-semibold">
                  <th className="py-3 px-4">Nama Perusahaan</th>
                  <th className="py-3 px-4">Alamat DUDI</th>
                  <th className="py-3 px-4">Pembimbing Industri</th>
                  <th className="py-3 px-4">Kuota / Siswa Aktif</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--card-border)] text-[var(--foreground)]">
                {filteredDudi.map((dudi) => (
                  <tr key={dudi.id} className="hover:bg-[var(--table-hover-bg)] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-xs">{dudi.name}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-500">{dudi.address}</td>
                    <td className="py-3.5 px-4 font-semibold">{dudi.industrySupervisor}</td>
                    <td className="py-3.5 px-4 font-mono font-bold">
                      {dudi.activeStudents} / {dudi.quota} Siswa
                    </td>
                    <td className="py-3.5 px-4 text-right">
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
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD/EDIT STUDENT MODAL */}
      {(isAddStudentOpen || editStudentTarget) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 relative">
            <button
              onClick={() => {
                setIsAddStudentOpen(false);
                setEditStudentTarget(null);
              }}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-bold text-[var(--card-title)] mb-1">
              {editStudentTarget ? "Edit Data Siswa PKL" : "Tambah Siswa Baru"}
            </h3>
            <p className="text-xs text-[var(--card-subtitle)] mb-4">
              Isi formulir data induk siswa PKL untuk dipasangkan ke mitra DUDI.
            </p>

            <form onSubmit={handleSaveStudent} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[var(--foreground)] mb-1">
                  Nama Lengkap Siswa <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={stdName}
                  onChange={(e) => setStdName(e.target.value)}
                  placeholder="Contoh: Muhammad Farhan"
                  className="w-full token-input p-2.5"
                />
              </div>

              <div>
                <label className="block font-semibold text-[var(--foreground)] mb-1">
                  NISN <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={stdNisn}
                  onChange={(e) => setStdNisn(e.target.value)}
                  placeholder="Contoh: 0054819299"
                  className="w-full token-input p-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[var(--foreground)] mb-1">Kelas</label>
                  <input
                    type="text"
                    required
                    value={stdClass}
                    onChange={(e) => setStdClass(e.target.value)}
                    className="w-full token-input p-2.5"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[var(--foreground)] mb-1">Jurusan</label>
                  <input
                    type="text"
                    required
                    value={stdDept}
                    onChange={(e) => setStdDept(e.target.value)}
                    className="w-full token-input p-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[var(--foreground)] mb-1">
                  Penempatan DUDI
                </label>
                <select
                  value={stdDudi}
                  onChange={(e) => setStdDudi(e.target.value)}
                  className="w-full token-input p-2.5"
                >
                  {dudiList.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddStudentOpen(false);
                    setEditStudentTarget(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm"
                >
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deleteStudentTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
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
      )}
    </div>
  );
}
