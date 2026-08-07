"use client";

import { create } from "zustand";

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

  // Data Collections
  students: Student[];
  dudiList: Dudi[];
  attendanceRecords: AttendanceRecord[];
  journals: JournalEntry[];
  evaluations: Evaluation[];
  toasts: ToastMessage[];
  notifications: NotificationItem[];

  // Action Handlers
  setRoute: (route: RoutePath) => void;
  setRole: (role: Role) => void;
  setSearchQuery: (query: string) => void;
  toggleSidebar: () => void;

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
  generateCertificate: (studentId: string) => string;

  // Notification Toast Actions
  addToast: (toast: Omit<ToastMessage, "id">) => void;
  removeToast: (id: string) => void;

  // In-App Notification Actions
  markAllNotificationsAsRead: () => void;
  deleteNotification: (id: string) => void;
}

// Seed Data (11 Students total to match Dashboard 1 data model)
const initialStudents: Student[] = [
  {
    id: "std-1",
    nisn: "0054819231",
    name: "Aulia Rahmawati",
    class: "XII RPL 1",
    department: "Rekayasa Perangkat Lunak",
    dudiName: "PT Sinar Data Nusantara",
    schoolSupervisor: "Bpk. Hendra Wijaya, S.Kom",
    industrySupervisor: "Ibu Maya Kartika",
    stage: "Pendaftaran & Pembekalan",
    status: "Pembekalan",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
    whatsapp: "081234567890",
    email: "aulia@smkn3.sch.id",
    attendanceRate: 100,
    journalCount: 0,
  },
  {
    id: "std-2",
    nisn: "0054819232",
    name: "Bagas Prayoga",
    class: "XII RPL 2",
    department: "Rekayasa Perangkat Lunak",
    dudiName: "CV Mitra Kreatif",
    schoolSupervisor: "Bpk. Hendra Wijaya, S.Kom",
    industrySupervisor: "Bpk. Budi Santoso",
    stage: "Pendaftaran & Pembekalan",
    status: "Pembekalan",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
    whatsapp: "082198765432",
    email: "bagas@smkn3.sch.id",
    attendanceRate: 100,
    journalCount: 0,
  },
  {
    id: "std-3",
    nisn: "0054819233",
    name: "Citra Kusuma",
    class: "XII TKJ 1",
    department: "Teknik Komputer & Jaringan",
    dudiName: "Studio Piksel",
    schoolSupervisor: "Ibu Rahmawati, M.Pd",
    industrySupervisor: "Bpk. Dian Sastro",
    stage: "Pendaftaran & Pembekalan",
    status: "Pembekalan",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
    whatsapp: "085712345678",
    email: "citra@smkn3.sch.id",
    attendanceRate: 100,
    journalCount: 0,
  },
  {
    id: "std-4",
    nisn: "0054819234",
    name: "Dita Ariyanti",
    class: "XII RPL 2",
    department: "Rekayasa Perangkat Lunak",
    dudiName: "PT Lumin Studio",
    schoolSupervisor: "Bpk. Hendra Wijaya, S.Kom",
    industrySupervisor: "Bpk. Irfan Maulana",
    stage: "Pelaksanaan (DUDI)",
    status: "Aktif",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150",
    whatsapp: "081211223344",
    email: "dita@smkn3.sch.id",
    attendanceRate: 98,
    journalCount: 22,
  },
  {
    id: "std-5",
    nisn: "0054819235",
    name: "Eko Wibowo",
    class: "XII TKJ 1",
    department: "Teknik Komputer & Jaringan",
    dudiName: "PT Jala Net",
    schoolSupervisor: "Bpk. Hendra Wijaya, S.Kom",
    industrySupervisor: "Bpk. Ari Wibowo",
    stage: "Pelaksanaan (DUDI)",
    status: "Aktif",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150",
    whatsapp: "081544556677",
    email: "eko@smkn3.sch.id",
    attendanceRate: 96,
    journalCount: 18,
  },
  {
    id: "std-6",
    nisn: "0054819236",
    name: "Fitri Handayani",
    class: "XII MM 2",
    department: "Multimedia",
    dudiName: "Studio Piksel",
    schoolSupervisor: "Ibu Rahmawati, M.Pd",
    industrySupervisor: "Ibu Siska Amelia",
    stage: "Pelaksanaan (DUDI)",
    status: "Aktif",
    avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=150",
    whatsapp: "081322334455",
    email: "fitri@smkn3.sch.id",
    attendanceRate: 94,
    journalCount: 20,
  },
  {
    id: "std-7",
    nisn: "0054819237",
    name: "Galih Pramudito",
    class: "XII TKJ 2",
    department: "Teknik Komputer & Jaringan",
    dudiName: "PT Sinar Data Nusantara",
    schoolSupervisor: "Ibu Rahmawati, M.Pd",
    industrySupervisor: "Bpk. Dian Sastro",
    stage: "Pelaksanaan (DUDI)",
    status: "Aktif",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150",
    whatsapp: "081433445566",
    email: "galih@smkn3.sch.id",
    attendanceRate: 97,
    journalCount: 28,
  },
  {
    id: "std-8",
    nisn: "0054819238",
    name: "Hana Salsabila",
    class: "XII MM 1",
    department: "Multimedia",
    dudiName: "KAP Anugarah",
    schoolSupervisor: "Ibu Rahmawati, M.Pd",
    industrySupervisor: "Ibu Siska Amelia",
    stage: "Penilaian & Review",
    status: "Aktif",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150",
    whatsapp: "081908070605",
    email: "hana@smkn3.sch.id",
    attendanceRate: 99,
    journalCount: 32,
  },
  {
    id: "std-9",
    nisn: "0054819239",
    name: "Eko Wibowo",
    class: "XII TKJ 1",
    department: "Teknik Komputer & Jaringan",
    dudiName: "PT Network Solution",
    schoolSupervisor: "Bpk. Hendra Wijaya, S.Kom",
    industrySupervisor: "Bpk. Ari Wibowo",
    stage: "Pendaftaran & Pembekalan",
    status: "Pembekalan",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=150",
    whatsapp: "081544556677",
    email: "eko.wibowo@smkn3.sch.id",
    attendanceRate: 88,
    journalCount: 4,
  },
  {
    id: "std-10",
    nisn: "0054819240",
    name: "Hendra Gunawan",
    class: "XII RPL 1",
    department: "Rekayasa Perangkat Lunak",
    dudiName: "CV Creative Digital",
    schoolSupervisor: "Bpk. Hendra Wijaya, S.Kom",
    industrySupervisor: "Bpk. Budi Santoso",
    stage: "Pendaftaran & Pembekalan",
    status: "Pembekalan",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150",
    whatsapp: "081655667788",
    email: "hendra.gunawan@smkn3.sch.id",
    attendanceRate: 92,
    journalCount: 6,
  },
  {
    id: "std-11",
    nisn: "0054819241",
    name: "Indah Permata",
    class: "XII MM 1",
    department: "Multimedia",
    dudiName: "Studio Anima Media",
    schoolSupervisor: "Ibu Rahmawati, M.Pd",
    industrySupervisor: "Ibu Siska Amelia",
    stage: "Selesai & Sertifikasi",
    status: "Selesai",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150",
    whatsapp: "081766778899",
    email: "indah.permata@smkn3.sch.id",
    attendanceRate: 99,
    journalCount: 35,
  },
];

const initialDudiList: Dudi[] = [
  {
    id: "dudi-1",
    name: "PT Technology Nusantara",
    address: "Jl. Sudirman No. 45, Jakarta Selatan",
    industrySupervisor: "Ibu Maya Kartika",
    quota: 10,
    activeStudents: 5,
    qrCode: "QR-TECH-NUSANTARA-2026",
  },
  {
    id: "dudi-2",
    name: "CV Creative Digital",
    address: "Jl. Gatot Subroto No. 12, Jakarta Selatan",
    industrySupervisor: "Bpk. Budi Santoso",
    quota: 6,
    activeStudents: 3,
    qrCode: "QR-CREATIVE-DIGITAL-2026",
  },
  {
    id: "dudi-3",
    name: "PT Telkom Indonesia",
    address: "Jl. M.H. Thamrin No. 8, Jakarta Pusat",
    industrySupervisor: "Bpk. Dian Sastro",
    quota: 15,
    activeStudents: 8,
    qrCode: "QR-TELKOM-ID-2026",
  },
];

const initialAttendanceRecords: AttendanceRecord[] = [
  {
    id: "att-1",
    studentId: "std-6",
    studentName: "Dita Ariyanti",
    dudiName: "PT Lumin Studio",
    date: "3 Agu 2026",
    timeIn: "08:02",
    timeOut: "16:05",
    timestamp: "2026-08-03 08:02:00",
    type: "Masuk",
    status: "Hadir",
    locationNote: "Scan QR di Lobby Studio",
  },
  {
    id: "att-2",
    studentId: "std-8",
    studentName: "Galih Pramudito",
    dudiName: "PT Sinar Data Nusantara",
    date: "3 Agu 2026",
    timeIn: "08:04",
    timeOut: "—",
    timestamp: "2026-08-03 08:04:00",
    type: "Masuk",
    status: "Hadir",
    locationNote: "Scan QR di Resepsionis",
  },
  {
    id: "att-3",
    studentId: "std-7",
    studentName: "Fitri Handayani",
    dudiName: "Studio Piksel",
    date: "3 Agu 2026",
    timeIn: "07:58",
    timeOut: "16:00",
    timestamp: "2026-08-03 07:58:00",
    type: "Masuk",
    status: "Hadir",
    locationNote: "Scan QR di Studio Utama",
  },
  {
    id: "att-4",
    studentId: "std-9",
    studentName: "Eko Wibowo",
    dudiName: "PT Jala Net",
    date: "2 Agu 2026",
    timeIn: "08:15",
    timeOut: "—",
    timestamp: "2026-08-02 08:15:00",
    type: "Masuk",
    status: "Hadir",
    locationNote: "Scan QR di Pos Jala Net",
  },
];

const initialJournals: JournalEntry[] = [
  {
    id: "jrn-1",
    studentId: "std-1",
    studentName: "Dita Ariyanti",
    dudiName: "PT Lumin Studio",
    date: "3 Agustus 2026",
    workHours: 8,
    title: "Menyusun UI komponen dashboard klien",
    description: "Membuat komponen kartu statistik dan tabel aktivitas menggunakan React.",
    status: "Menunggu verifikasi",
  },
  {
    id: "jrn-2",
    studentId: "std-2",
    studentName: "Galih Pramudito",
    dudiName: "Creative Space",
    date: "13 Agustus 2026",
    workHours: 7,
    title: "Dokumentasi foto aktivitas",
    description: "Menambahkan dua foto bukti kegiatan produksi konten.",
    status: "Menunggu verifikasi",
  },
  {
    id: "jrn-3",
    studentId: "std-3",
    studentName: "Fitri Handayani",
    dudiName: "PT Telkom Indonesia",
    date: "7 Agustus 2026",
    workHours: 8,
    title: "Konfigurasi jaringan kantor",
    description: "Membantu setup switch dan pengalamatan IP di lantai 3.",
    status: "Terverifikasi",
  },
  {
    id: "jrn-4",
    studentId: "std-4",
    studentName: "Eko Wibowo",
    dudiName: "PT Jala Net",
    date: "30 Agustus 2026",
    workHours: 8,
    title: "Perawatan perangkat",
    description: "Membersihkan dan memeriksa perangkat jaringan.",
    status: "Terverifikasi",
  },
];

const initialEvaluations: Evaluation[] = [
  {
    id: "eval-1",
    studentId: "std-4",
    studentName: "Dewi Anggraini",
    dudiName: "Studio Anima Media",
    technicalScore: 92,
    softSkillScore: 88,
    disciplineScore: 95,
    ethicsScore: 90,
    finalScore: 91.25,
    grade: "A",
    status: "Terverifikasi",
    certificateNumber: "PKL-SMKN3-2026-8942",
    issuedAt: "2026-08-01",
  },
];

const initialNotifications: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Jurnal menunggu verifikasi",
    message: "Ada jurnal baru dari Dita Ariyanti yang perlu diverifikasi.",
    timestamp: "3 Agu 2026, 09.25",
    isRead: false,
  },
  {
    id: "notif-2",
    title: "Anomali absensi terdeteksi",
    message: "Eko Wibowo belum absen pulang kemarin.",
    timestamp: "3 Agu 2026, 09.25",
    isRead: false,
  },
  {
    id: "notif-3",
    title: "Sertifikat siap diterbitkan",
    message: "Jasmine Ayu telah menyelesaikan seluruh tahapan PKL...",
    timestamp: "3 Agu 2026, 09.25",
    isRead: false,
  },
];

export const useInternTrackStore = create<InternTrackState>((set, get) => ({
  // Initial State
  currentRoute: "dashboard",
  currentRole: "Admin",
  searchQuery: "",
  isSidebarOpen: true,

  students: initialStudents,
  dudiList: initialDudiList,
  attendanceRecords: initialAttendanceRecords,
  journals: initialJournals,
  evaluations: initialEvaluations,
  toasts: [],
  notifications: initialNotifications,

  setRoute: (route) => set({ currentRoute: route }),
  setRole: (role) => {
    set({ currentRole: role });
    get().addToast({
      type: "info",
      title: "Peran Diubah",
      message: `Sekarang melihat dashboard sebagai ${role}`,
    });
  },
  setSearchQuery: (query) => set({ searchQuery: query }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  // CRUD Actions
  addStudent: (newStd) => {
    const id = `std-${Date.now()}`;
    const student: Student = { ...newStd, id };
    set((state) => ({ students: [student, ...state.students] }));
    get().addToast({
      type: "success",
      title: "Siswa Ditambahkan",
      message: `${newStd.name} berhasil didaftarkan ke sistem PKL.`,
    });
  },

  updateStudent: (id, updated) => {
    set((state) => ({
      students: state.students.map((s) => (s.id === id ? { ...s, ...updated } : s)),
    }));
    get().addToast({
      type: "success",
      title: "Data Diperbarui",
      message: "Informasi siswa telah berhasil disimpan.",
    });
  },

  deleteStudent: (id) => {
    const target = get().students.find((s) => s.id === id);
    set((state) => ({
      students: state.students.filter((s) => s.id !== id),
    }));
    get().addToast({
      type: "warning",
      title: "Siswa Dihapus",
      message: `Data ${target?.name || "Siswa"} telah dihapus dari sistem.`,
    });
  },

  moveKanbanStage: (studentId, targetStage) => {
    set((state) => ({
      students: state.students.map((s) =>
        s.id === studentId ? { ...s, stage: targetStage } : s
      ),
    }));
    get().addToast({
      type: "info",
      title: "Tahapan Diperbarui",
      message: `Siswa telah dipindahkan ke tahap ${targetStage}`,
    });
  },

  addDudi: (newDudi) => {
    const id = `dudi-${Date.now()}`;
    const dudi: Dudi = {
      ...newDudi,
      id,
      qrCode: `QR-${newDudi.name.replace(/\s+/g, "-").toUpperCase()}-2026`,
    };
    set((state) => ({ dudiList: [...state.dudiList, dudi] }));
    get().addToast({
      type: "success",
      title: "DUDI Ditambahkan",
      message: `${newDudi.name} berhasil ditambahkan sebagai mitra PKL.`,
    });
  },

  updateDudi: (id, updated) => {
    set((state) => ({
      dudiList: state.dudiList.map((d) => (d.id === id ? { ...d, ...updated } : d)),
    }));
    get().addToast({
      type: "success",
      title: "Mitra DUDI Diperbarui",
      message: "Informasi perusahaan telah diperbarui.",
    });
  },

  deleteDudi: (id) => {
    set((state) => ({
      dudiList: state.dudiList.filter((d) => d.id !== id),
    }));
    get().addToast({
      type: "warning",
      title: "DUDI Dihapus",
      message: "Perusahaan mitra telah dihapus dari database.",
    });
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

  correctAttendance: (id, status, note) => {
    set((state) => ({
      attendanceRecords: state.attendanceRecords.map((att) =>
        att.id === id ? { ...att, status, correctionNote: note } : att
      ),
    }));
    get().addToast({
      type: "info",
      title: "Koreksi Absensi",
      message: `Status presensi berhasil dikoreksi menjadi ${status}.`,
    });
  },

  addAttendanceRecord: (record) => {
    const id = `att-${Date.now()}`;
    const newRecord: AttendanceRecord = { ...record, id };
    set((state) => ({ attendanceRecords: [newRecord, ...state.attendanceRecords] }));
    get().addToast({
      type: "success",
      title: "Absensi Dicatat",
      message: `Data presensi untuk ${record.studentName} telah berhasil disimpan.`,
    });
  },

  updateAttendanceRecord: (id, updated) => {
    set((state) => ({
      attendanceRecords: state.attendanceRecords.map((att) =>
        att.id === id ? { ...att, ...updated } : att
      ),
    }));
    get().addToast({
      type: "success",
      title: "Absensi Diperbarui",
      message: "Catatan presensi siswa berhasil diperbarui.",
    });
  },

  deleteAttendanceRecord: (id) => {
    const target = get().attendanceRecords.find((a) => a.id === id);
    set((state) => ({
      attendanceRecords: state.attendanceRecords.filter((att) => att.id !== id),
    }));
    get().addToast({
      type: "warning",
      title: "Absensi Dihapus",
      message: `Presensi ${target?.studentName || ""} berhasil dihapus dari data.`,
    });
  },

  addJournalEntry: (entry) => {
    const id = `jrn-${Date.now()}`;
    const newJournal: JournalEntry = {
      ...entry,
      id,
      status: "Menunggu verifikasi",
    };
    set((state) => ({ journals: [newJournal, ...state.journals] }));
    get().addToast({
      type: "success",
      title: "Jurnal Terkirim",
      message: "Entri jurnal harian telah dikirim untuk diverifikasi pembimbing.",
    });
  },

  updateJournalEntry: (id, updated) => {
    set((state) => ({
      journals: state.journals.map((j) => (j.id === id ? { ...j, ...updated } : j)),
    }));
    get().addToast({
      type: "success",
      title: "Jurnal Diperbarui",
      message: "Jurnal berhasil diperbarui.",
    });
  },

  deleteJournalEntry: (id) => {
    const target = get().journals.find((j) => j.id === id);
    set((state) => ({
      journals: state.journals.filter((j) => j.id !== id),
    }));
    get().addToast({
      type: "warning",
      title: "Jurnal Dihapus",
      message: `Jurnal "${target?.title || ""}" berhasil dihapus.`,
    });
  },

  reviewJournal: (id, status, feedback, reviewerName) => {
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
    get().addToast({
      type: status === "Terverifikasi" ? "success" : "warning",
      title: `Jurnal ${status}`,
      message: `Status jurnal telah diperbarui menjadi ${status}.`,
    });
  },

  submitEvaluation: (evalData) => {
    const finalScore =
      (evalData.technicalScore +
        evalData.softSkillScore +
        evalData.disciplineScore +
        evalData.ethicsScore) /
      4;

    let grade: "A" | "B" | "C" | "D" = "C";
    if (finalScore >= 90) grade = "A";
    else if (finalScore >= 80) grade = "B";
    else if (finalScore >= 70) grade = "C";
    else grade = "D";

    const id = `eval-${Date.now()}`;
    const newEval: Evaluation = {
      ...evalData,
      id,
      finalScore: Number(finalScore.toFixed(2)),
      grade,
      status: "Terverifikasi",
    };

    set((state) => ({
      evaluations: [newEval, ...state.evaluations],
    }));

    get().addToast({
      type: "success",
      title: "Penilaian Berhasil",
      message: `Penilaian untuk ${evalData.studentName} tersimpan dengan nilai akhir ${finalScore.toFixed(1)} (${grade}).`,
    });
  },

  generateCertificate: (studentId) => {
    const student = get().students.find((s) => s.id === studentId);
    if (!student) return "";

    const certNo = `PKL-SMKN3-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString().split("T")[0];
    const existingEval = get().evaluations.find((e) => e.studentId === studentId);

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

    get().addToast({
      type: "success",
      title: "Sertifikat Diterbitkan",
      message: `Sertifikat untuk ${student.name} berhasil diterbitkan dengan nomor ${certNo}.`,
    });
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
  
  deleteNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },
}));
