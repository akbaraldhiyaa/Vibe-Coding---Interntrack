"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { addStudent as addStudentDB, deleteStudent as deleteStudentDB, updateStudent as updateStudentDB, updateStudentStage as updateStudentStageDB } from "@/app/actions/students";
import { addDudi as addDudiDB, deleteDudi as deleteDudiDB, updateDudi as updateDudiDB } from "@/app/actions/dudi";
import { addAttendance as addAttendanceDB, deleteAttendance as deleteAttendanceDB, updateAttendance as updateAttendanceDB } from "@/app/actions/attendance";
import { addJournal as addJournalDB, deleteJournal as deleteJournalDB, updateJournal as updateJournalDB, updateJournalStatus as updateJournalStatusDB } from "@/app/actions/journal";
import { addEvaluation as addEvaluationDB, updateEvaluation as updateEvaluationDB, issueCertificateDB } from "@/app/actions/evaluation";

export type Role = "Admin" | "Guru Pembimbing" | "Pembimbing Industri" | "Siswa" | "Kepala Sekolah";

export type RoutePath =
  | "dashboard"
  | "kanban"
  | "absensi"
  | "jurnal"
  | "penilaian"
  | "master-data"
  | "notifikasi"
  | "pengaturan";

export type KanbanStage =
  | "Pendaftaran & Pembekalan"
  | "Pelaksanaan (DUDI)"
  | "Penilaian & Review"
  | "Selesai & Sertifikasi";

export interface Student {
  id: string;
  nisn: string;
  name: string;
  class: string;
  department: string;
  dudiName: string;
  schoolSupervisor: string;
  industrySupervisor: string;
  stage: KanbanStage;
  status: "Aktif" | "Selesai" | "Bermasalah" | "Pembekalan";
  avatar: string;
  whatsapp: string;
  email: string;
  attendanceRate: number; // percentage
  journalCount: number;
}

export interface Dudi {
  id: string;
  name: string;
  address: string;
  industrySupervisor: string;
  quota: number;
  activeStudents: number;
  qrCode: string;
}

export interface AttendanceRecord {
  id: string;
  studentId?: string;
  studentName: string;
  dudiName: string;
  date?: string;
  timeIn?: string;
  timeOut?: string;
  timestamp?: string; // ISO string or format
  type?: "Masuk" | "Pulang";
  status: "Hadir" | "Terlambat" | "Izin" | "Sakit" | "Tidak Hadir" | "Anomali" | "Alpa";
  locationNote?: string;
  correctionNote?: string;
}

export interface JournalEntry {
  id: string;
  studentId: string;
  studentName: string;
  dudiName: string;
  date: string;
  workHours: number;
  title: string;
  description: string;
  photoUrl?: string;
  status: "Menunggu verifikasi" | "Terverifikasi" | "Perlu revisi";
  feedback?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface Evaluation {
  id: string;
  studentId: string;
  studentName: string;
  dudiName: string;
  technicalScore: number;
  softSkillScore: number;
  disciplineScore: number;
  ethicsScore: number;
  finalScore: number;
  grade: "A" | "B" | "C" | "D";
  status: "Draft" | "Terverifikasi";
  certificateNumber?: string;
  issuedAt?: string;
}

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

interface InternTrackState {
  // Navigation & User Context
  currentRoute: RoutePath;
  currentRole: Role;
  searchQuery: string;
  isSidebarOpen: boolean;
  userProfile: {
    fullName: string;
    email: string;
    whatsapp: string;
    institution: string;
    department: string;
    notificationEmail: boolean;
    weeklySummary: boolean;
  };

  // Data Collections
  students: Student[];
  dudiList: Dudi[];
  attendanceRecords: AttendanceRecord[];
  journals: JournalEntry[];
  evaluations: Evaluation[];
  toasts: ToastMessage[];
  notifications: NotificationItem[];

  // Action Handlers
  initData: (data: Partial<InternTrackState>) => void;
  setRoute: (route: RoutePath) => void;
  setRole: (role: Role) => void;
  setSearchQuery: (query: string) => void;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  updateUserProfile: (profile: Partial<InternTrackState["userProfile"]>) => void;

  // CRUD Actions
  addStudent: (student: Omit<Student, "id">) => void;
  updateStudent: (id: string, updated: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  moveKanbanStage: (studentId: string, targetStage: KanbanStage) => void;

  addDudi: (dudi: Omit<Dudi, "id">) => void;
  updateDudi: (id: string, updated: Partial<Dudi>) => void;
  deleteDudi: (id: string) => void;

  logAttendance: (record: Omit<AttendanceRecord, "id">) => void;
  correctAttendance: (id: string, status: AttendanceRecord["status"], note: string) => void;
  addAttendanceRecord: (record: Omit<AttendanceRecord, "id">) => void;
  updateAttendanceRecord: (id: string, updated: Partial<AttendanceRecord>) => void;
  deleteAttendanceRecord: (id: string) => void;

  addJournalEntry: (entry: Omit<JournalEntry, "id" | "status">) => void;
  updateJournalEntry: (id: string, updated: Partial<JournalEntry>) => void;
  deleteJournalEntry: (id: string) => void;
  reviewJournal: (id: string, status: JournalEntry["status"], feedback?: string, reviewerName?: string) => void;

  submitEvaluation: (evaluation: Omit<Evaluation, "id" | "finalScore" | "grade">) => void;
  generateCertificate: (studentId: string) => Promise<string> | string;

  // Notification Toast Actions
  addToast: (toast: Omit<ToastMessage, "id">) => void;
  removeToast: (id: string) => void;

  // In-App Notification Actions
  markAllNotificationsAsRead: () => void;
  deleteNotification: (id: string) => void;
}

export const useInternTrackStore = create<InternTrackState>()(
  persist(
    (set, get) => ({
  // Initial State
  currentRoute: "dashboard",
  currentRole: "Admin",
  searchQuery: "",
  isSidebarOpen: true,

  userProfile: {
    fullName: "Siswa Magang",
    email: "siswa@smkn3.sch.id",
    whatsapp: "",
    institution: "SMKN 3 Bandung",
    department: "Rekayasa Perangkat Lunak",
    notificationEmail: true,
    weeklySummary: false,
  },

  students: [],
  dudiList: [],
  attendanceRecords: [],
  journals: [],
  evaluations: [],
  toasts: [],
  notifications: [],

  initData: (data) => set((state) => ({ ...state, ...data })),
  setRoute: (route) => set({ currentRoute: route }),
  setRole: (role) => set({ currentRole: role }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  closeSidebar: () => set({ isSidebarOpen: false }),
  updateUserProfile: (profile) =>
    set((state) => ({
      userProfile: { ...state.userProfile, ...profile },
    })),

  // CRUD Actions
  addStudent: async (newStd) => {
    const res = await addStudentDB({
      nisn: newStd.nisn,
      name: newStd.name,
      class: newStd.class,
      department: newStd.department,
    });
    
    if (res.success && res.data) {
      const student: Student = { ...newStd, id: res.data.id };
      set((state) => ({ students: [student, ...state.students] }));
      get().addToast({
        type: "success",
        title: "Siswa Ditambahkan",
        message: `${newStd.name} berhasil didaftarkan ke sistem PKL.`,
      });
    } else {
      get().addToast({
        type: "error",
        title: "Gagal Menambahkan Siswa",
        message: res.error || "Terjadi kesalahan pada server.",
      });
    }
  },

  updateStudent: async (id, updated) => {
    // Optimistic UI update
    const previousStudents = get().students;
    set((state) => ({
      students: state.students.map((s) => (s.id === id ? { ...s, ...updated } : s)),
    }));

    const res = await updateStudentDB(id, updated);
    if (res.success) {
      get().addToast({
        type: "success",
        title: "Data Diperbarui",
        message: "Informasi siswa telah berhasil disimpan ke database.",
      });
    } else {
      // Revert if failed
      set({ students: previousStudents });
      get().addToast({
        type: "error",
        title: "Gagal Memperbarui",
        message: res.error || "Gagal menyimpan data ke database.",
      });
    }
  },

  deleteStudent: async (id) => {
    const target = get().students.find((s) => s.id === id);
    if (!target) return;
    
    // Optimistic UI delete
    set((state) => ({
      students: state.students.filter((s) => s.id !== id),
    }));

    const res = await deleteStudentDB(id);
    
    if (res.success) {
      get().addToast({
        type: "warning",
        title: "Siswa Dihapus",
        message: `Data ${target.name} telah dihapus dari sistem.`,
      });
    } else {
      // Revert if failed
      set((state) => ({ students: [target, ...state.students] }));
      get().addToast({
        type: "error",
        title: "Gagal Menghapus",
        message: "Siswa tidak dapat dihapus dari database.",
      });
    }
  },

  moveKanbanStage: async (studentId, targetStage) => {
    const previousStudents = get().students;
    // Optimistic UI update
    set((state) => ({
      students: state.students.map((s) =>
        s.id === studentId ? { ...s, stage: targetStage } : s
      ),
    }));

    const res = await updateStudentStageDB(studentId, targetStage);
    if (res.success) {
      get().addToast({
        type: "info",
        title: "Tahapan Diperbarui",
        message: `Siswa telah dipindahkan ke tahap ${targetStage}`,
      });
    } else {
      // Revert
      set({ students: previousStudents });
      get().addToast({
        type: "error",
        title: "Gagal Memperbarui Tahapan",
        message: "Perubahan dikembalikan karena gagal menyimpan ke database.",
      });
    }
  },

  addDudi: async (newDudi) => {
    const res = await addDudiDB({
      name: newDudi.name,
      address: newDudi.address,
      industrySupervisor: newDudi.industrySupervisor,
      quota: newDudi.quota,
    });
    
    if (res.success && res.data) {
      const dudi: Dudi = {
        ...newDudi,
        id: res.data.id,
        qrCode: `QR-${newDudi.name.replace(/\s+/g, "-").toUpperCase()}-2026`,
      };
      set((state) => ({ dudiList: [...state.dudiList, dudi] }));
      get().addToast({
        type: "success",
        title: "DUDI Ditambahkan",
        message: `${newDudi.name} berhasil ditambahkan sebagai mitra PKL.`,
      });
    } else {
      get().addToast({
        type: "error",
        title: "Gagal Menambahkan DUDI",
        message: res.error || "Terjadi kesalahan pada server.",
      });
    }
  },

  updateDudi: async (id, updated) => {
    const previousDudis = get().dudiList;
    set((state) => ({
      dudiList: state.dudiList.map((d) => (d.id === id ? { ...d, ...updated } : d)),
    }));

    const res = await updateDudiDB(id, updated);
    if (res.success) {
      get().addToast({
        type: "success",
        title: "Mitra DUDI Diperbarui",
        message: "Informasi perusahaan telah diperbarui di database.",
      });
    } else {
      set({ dudiList: previousDudis });
      get().addToast({
        type: "error",
        title: "Gagal Memperbarui DUDI",
        message: "Perubahan dibatalkan karena gagal menyimpan ke server.",
      });
    }
  },

  deleteDudi: async (id) => {
    const target = get().dudiList.find((d) => d.id === id);
    if (!target) return;
    
    set((state) => ({
      dudiList: state.dudiList.filter((d) => d.id !== id),
    }));

    const res = await deleteDudiDB(id);

    if (res.success) {
      get().addToast({
        type: "warning",
        title: "DUDI Dihapus",
        message: "Perusahaan mitra telah dihapus dari database.",
      });
    } else {
      set((state) => ({ dudiList: [...state.dudiList, target] }));
      get().addToast({
        type: "error",
        title: "Gagal Menghapus DUDI",
        message: "Terjadi kesalahan pada server.",
      });
    }
  },

  logAttendance: (record) => {
    const id = `att-${Date.now()}`;
    const newRecord: AttendanceRecord = { ...record, id };
    set((state) => ({ attendanceRecords: [newRecord, ...state.attendanceRecords] }));
    get().addToast({
      type: record.status === "Anomali" ? "warning" : "success",
      title: record.status === "Anomali" ? "Absensi Anomali" : "Presensi Berhasil",
      message: `${record.studentName} melakukan presensi ${record.type} di ${record.dudiName}.`,
    });
  },

  correctAttendance: async (id, status, note) => {
    const previous = get().attendanceRecords;
    set((state) => ({
      attendanceRecords: state.attendanceRecords.map((att) =>
        att.id === id ? { ...att, status, correctionNote: note } : att
      ),
    }));

    const res = await updateAttendanceDB(id, {
      status,
      correctionNote: note,
    });

    if (res.success) {
      get().addToast({
        type: "info",
        title: "Koreksi Absensi",
        message: `Status presensi berhasil dikoreksi menjadi ${status}.`,
      });
    } else {
      set({ attendanceRecords: previous });
      get().addToast({
        type: "error",
        title: "Gagal Mengoreksi Absensi",
        message: res.error || "Gagal menyimpan koreksi absensi ke database.",
      });
    }
  },

  addAttendanceRecord: async (record) => {
    // Attempt DB first
    const res = await addAttendanceDB({
      studentId: record.studentId || "",
      date: record.date || new Date().toISOString(),
      timeIn: record.timeIn,
      timeOut: record.timeOut,
      status: record.status,
      correctionNote: record.correctionNote,
    });

    if (res.success && res.data) {
      const newRecord: AttendanceRecord = { ...record, id: res.data.id };
      set((state) => ({ attendanceRecords: [newRecord, ...state.attendanceRecords] }));
      get().addToast({
        type: "success",
        title: "Absensi Dicatat",
        message: `Data presensi untuk ${record.studentName} telah berhasil disimpan ke database.`,
      });
    } else {
      get().addToast({
        type: "error",
        title: "Gagal Mencatat Absensi",
        message: res.error || "Terjadi kesalahan pada server.",
      });
    }
  },

  updateAttendanceRecord: async (id, updated) => {
    const previous = get().attendanceRecords;
    set((state) => ({
      attendanceRecords: state.attendanceRecords.map((att) =>
        att.id === id ? { ...att, ...updated } : att
      ),
    }));

    const res = await updateAttendanceDB(id, {
      date: updated.date,
      timeIn: updated.timeIn,
      timeOut: updated.timeOut,
      status: updated.status,
      correctionNote: updated.correctionNote,
    });

    if (res.success) {
      get().addToast({
        type: "success",
        title: "Absensi Diperbarui",
        message: "Catatan presensi siswa berhasil diperbarui di database.",
      });
    } else {
      set({ attendanceRecords: previous });
      get().addToast({
        type: "error",
        title: "Gagal Memperbarui Absensi",
        message: res.error || "Gagal menyimpan perubahan ke database.",
      });
    }
  },

  deleteAttendanceRecord: async (id) => {
    const target = get().attendanceRecords.find((a) => a.id === id);
    if (!target) return;

    set((state) => ({
      attendanceRecords: state.attendanceRecords.filter((att) => att.id !== id),
    }));

    const res = await deleteAttendanceDB(id);

    if (res.success) {
      get().addToast({
        type: "warning",
        title: "Absensi Dihapus",
        message: `Presensi ${target.studentName} berhasil dihapus dari database.`,
      });
    } else {
      set((state) => ({ attendanceRecords: [target, ...state.attendanceRecords] }));
      get().addToast({
        type: "error",
        title: "Gagal Menghapus Absensi",
        message: res.error || "Terjadi kesalahan pada server.",
      });
    }
  },

  addJournalEntry: async (entry) => {
    const res = await addJournalDB({
      studentId: entry.studentId,
      date: entry.date,
      activity: entry.title,
      description: entry.description,
      image: entry.photoUrl,
    });

    if (res.success && res.data) {
      const newJournal: JournalEntry = {
        ...entry,
        id: res.data.id,
        status: "Menunggu verifikasi",
      };
      set((state) => ({ journals: [newJournal, ...state.journals] }));
      get().addToast({
        type: "success",
        title: "Jurnal Disimpan",
        message: "Laporan kegiatan harian berhasil dikirim.",
      });
    } else {
      get().addToast({
        type: "error",
        title: "Gagal Menyimpan Jurnal",
        message: res.error || "Terjadi kesalahan pada server.",
      });
    }
  },

  updateJournalEntry: async (id, updated) => {
    const previous = get().journals;
    set((state) => ({
      journals: state.journals.map((j) => (j.id === id ? { ...j, ...updated } : j)),
    }));

    const res = await updateJournalDB(id, {
      date: updated.date,
      activity: updated.title,
      description: updated.description,
      status: updated.status,
      image: updated.photoUrl,
      feedback: updated.feedback,
    });

    if (res.success) {
      get().addToast({
        type: "success",
        title: "Jurnal Diperbarui",
        message: "Data jurnal berhasil disimpan ke database.",
      });
    } else {
      set({ journals: previous });
      get().addToast({
        type: "error",
        title: "Gagal Memperbarui Jurnal",
        message: res.error || "Gagal menyimpan perubahan jurnal ke database.",
      });
    }
  },

  deleteJournalEntry: async (id) => {
    const target = get().journals.find((j) => j.id === id);
    if (!target) return;

    set((state) => ({
      journals: state.journals.filter((j) => j.id !== id),
    }));

    const res = await deleteJournalDB(id);

    if (res.success) {
      get().addToast({
        type: "warning",
        title: "Jurnal Dihapus",
        message: "Catatan aktivitas telah dihapus secara permanen.",
      });
    } else {
      set((state) => ({ journals: [target, ...state.journals] }));
      get().addToast({
        type: "error",
        title: "Gagal Menghapus Jurnal",
        message: res.error || "Terjadi kesalahan pada server.",
      });
    }
  },

  reviewJournal: async (id, status, feedback, reviewerName) => {
    const previous = get().journals;
    const now = new Date().toISOString().replace("T", " ").substring(0, 16);
    set((state) => ({
      journals: state.journals.map((j) =>
        j.id === id
          ? {
              ...j,
              status,
              feedback: feedback || j.feedback,
              reviewedBy: reviewerName || "Guru Pembimbing",
              reviewedAt: now,
            }
          : j
      ),
    }));

    const res = await updateJournalStatusDB(id, status, feedback);

    if (res.success) {
      get().addToast({
        type: status === "Terverifikasi" ? "success" : "warning",
        title: `Jurnal ${status}`,
        message: `Status jurnal telah berhasil disimpan ke database sebagai ${status}.`,
      });
    } else {
      set({ journals: previous });
      get().addToast({
        type: "error",
        title: "Gagal Memperbarui Status Jurnal",
        message: res.error || "Gagal menyimpan status jurnal ke database.",
      });
    }
  },

  submitEvaluation: async (evaluation) => {
    const finalScore =
      evaluation.technicalScore * 0.4 +
      evaluation.softSkillScore * 0.3 +
      evaluation.disciplineScore * 0.15 +
      evaluation.ethicsScore * 0.15;

    let grade: "A" | "B" | "C" | "D" = "A";
    if (finalScore >= 90) grade = "A";
    else if (finalScore >= 80) grade = "B";
    else if (finalScore >= 70) grade = "C";
    else grade = "D";

    const res = await addEvaluationDB({
      studentId: evaluation.studentId,
      technicalScore: evaluation.technicalScore,
      nonTechnicalScore: evaluation.softSkillScore, // mapping
      finalScore: finalScore,
      notes: "",
    });

    if (res.success && res.data) {
      const newEvaluation: Evaluation = {
        ...evaluation,
        id: res.data.id,
        finalScore,
        grade,
        status: "Draft",
      };

      set((state) => ({ evaluations: [newEvaluation, ...state.evaluations] }));
      get().addToast({
        type: "success",
        title: "Penilaian Tersimpan",
        message: "Data penilaian siswa berhasil disimpan sebagai Draft.",
      });
    } else {
      get().addToast({
        type: "error",
        title: "Gagal Menyimpan Penilaian",
        message: res.error || "Terjadi kesalahan pada server.",
      });
    }
  },

  generateCertificate: async (studentId) => {
    const student = get().students.find((s) => s.id === studentId);
    if (!student) return "";

    const certNo = `PKL-SMKN3-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString().split("T")[0];
    const previousEvaluations = get().evaluations;
    const existingEval = previousEvaluations.find((e) => e.studentId === studentId);

    if (existingEval) {
      set((state) => ({
        evaluations: state.evaluations.map((ev) =>
          ev.studentId === studentId
            ? { ...ev, certificateNumber: certNo, issuedAt: now }
            : ev
        ),
      }));
    } else {
      // Create placeholder evaluation for UI parity with Figma design
      const newEval: Evaluation = {
        id: `eval-${Date.now()}`,
        studentId: student.id,
        studentName: student.name,
        dudiName: student.dudiName,
        technicalScore: 85,
        softSkillScore: 85,
        disciplineScore: 85,
        ethicsScore: 85,
        finalScore: 85,
        grade: "B",
        status: "Terverifikasi",
        certificateNumber: certNo,
        issuedAt: now,
      };
      set((state) => ({ evaluations: [newEval, ...state.evaluations] }));
    }

    const res = await issueCertificateDB(studentId, certNo);

    if (res.success) {
      get().addToast({
        type: "success",
        title: "Sertifikat Diterbitkan",
        message: `Sertifikat untuk ${student.name} berhasil diterbitkan dengan nomor ${certNo}.`,
      });
    } else {
      set({ evaluations: previousEvaluations });
      get().addToast({
        type: "error",
        title: "Gagal Menerbitkan Sertifikat",
        message: res.error || "Gagal menyimpan penerbitan sertifikat ke database.",
      });
    }
    return certNo;
  },

  addToast: (newToast) => {
    const id = `toast-${Date.now()}`;
    set((state) => ({ toasts: [...state.toasts, { ...newToast, id }] }));
    setTimeout(() => {
      get().removeToast(id);
    }, 5000);
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  // Notification Actions
  markAllNotificationsAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
    }));
  },
  
  deleteNotification: (id: string) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },
}),
{
  name: "interntrack-storage",
  partialize: (state) => ({ userProfile: state.userProfile }),
}
  )
);
