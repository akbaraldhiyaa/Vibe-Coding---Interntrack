import { z } from "zod";

export const studentSchema = z.object({
  nisn: z
    .string()
    .min(10, "NISN harus terdiri dari minimal 10 karakter angka")
    .max(10, "NISN tidak boleh lebih dari 10 karakter")
    .regex(/^\d+$/, "NISN hanya boleh berisi angka"),
  name: z
    .string()
    .min(3, "Nama lengkap harus terdiri dari minimal 3 karakter")
    .max(50, "Nama lengkap maksimal 50 karakter"),
  class: z.string().min(2, "Kelas harus diisi"),
  department: z.string().min(3, "Jurusan harus diisi"),
  dudiName: z.string().optional(),
});

export type StudentFormValues = z.infer<typeof studentSchema>;

export const dudiSchema = z.object({
  name: z.string().min(3, "Nama Perusahaan minimal 3 karakter"),
  address: z.string().min(10, "Alamat minimal 10 karakter"),
  industrySupervisor: z.string().min(3, "Nama pembimbing industri minimal 3 karakter"),
  quota: z
    .number({ message: "Kuota harus berupa angka" })
    .min(1, "Kuota minimal 1 siswa")
    .max(100, "Kuota maksimal 100 siswa"),
});

export type DudiFormValues = z.infer<typeof dudiSchema>;

export const journalSchema = z.object({
  studentName: z.string().min(1, "Nama siswa wajib diisi"),
  dudiName: z.string().min(1, "Nama perusahaan wajib diisi"),
  date: z.string().min(1, "Tanggal wajib diisi"),
  workHours: z
    .number({ message: "Durasi kerja harus berupa angka" })
    .min(1, "Durasi kerja minimal 1 jam")
    .max(24, "Durasi kerja maksimal 24 jam"),
  title: z.string().min(5, "Judul aktivitas minimal 5 karakter").max(100, "Judul aktivitas maksimal 100 karakter"),
  description: z.string().min(10, "Deskripsi aktivitas minimal 10 karakter"),
  status: z.enum(["Menunggu verifikasi", "Terverifikasi", "Perlu revisi"]).optional(),
});

export type JournalFormValues = z.infer<typeof journalSchema>;

export const attendanceSchema = z.object({
  studentName: z.string().min(1, "Nama siswa wajib diisi"),
  dudiName: z.string().min(1, "Nama perusahaan wajib diisi"),
  date: z.string().min(1, "Tanggal wajib diisi"),
  timeIn: z.string().min(1, "Jam masuk wajib diisi"),
  timeOut: z.string().optional(),
  status: z.enum(["Hadir", "Terlambat", "Izin", "Sakit", "Tidak Hadir", "Anomali", "Alpa"]),
  correctionNote: z.string().optional(),
});

export type AttendanceFormValues = z.infer<typeof attendanceSchema>;
