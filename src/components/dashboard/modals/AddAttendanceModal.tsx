"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { attendanceSchema, AttendanceFormValues } from "@/shared/validations";
import { useInternTrackStore, AttendanceRecord } from "@/shared/store/useInternTrackStore";
import { X, Loader2, Clock, AlertTriangle } from "lucide-react";
import FocusLock from "react-focus-lock";

interface AddAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  editTarget?: AttendanceRecord | null;
  isAdmin?: boolean;
}

export default function AddAttendanceModal({ isOpen, onClose, editTarget, isAdmin }: AddAttendanceModalProps) {
  const { addAttendanceRecord, updateAttendanceRecord, students, dudiList } = useInternTrackStore();

  const defaultStudent = students[0];
  const defaultDudiName = dudiList.find((d) => d.name === defaultStudent?.dudiName)?.name || dudiList[0]?.name || "";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<AttendanceFormValues>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: {
      studentName: editTarget?.studentName || defaultStudent?.name || "",
      dudiName: editTarget?.dudiName || defaultDudiName,
      date: editTarget?.date || new Date().toISOString().split("T")[0],
      timeIn: editTarget?.timeIn || "08:00",
      timeOut: editTarget?.timeOut || "16:00",
      status: editTarget?.status || "Hadir",
      correctionNote: editTarget?.correctionNote || "",
    },
  });

  const watchStudentName = watch("studentName");

  // Auto-fill DUDI name when student changes
  useEffect(() => {
    if (!editTarget && watchStudentName) {
      const student = students.find((s) => s.name === watchStudentName);
      if (student && student.dudiName) {
        setValue("dudiName", student.dudiName);
      }
    }
  }, [watchStudentName, students, setValue, editTarget]);

  // Reset form when modal opens with new target
  useEffect(() => {
    if (isOpen) {
      reset({
        studentName: editTarget?.studentName || defaultStudent?.name || "",
        dudiName: editTarget?.dudiName || defaultDudiName,
        date: editTarget?.date || new Date().toISOString().split("T")[0],
        timeIn: editTarget?.timeIn || "08:00",
        timeOut: editTarget?.timeOut || "16:00",
        status: editTarget?.status || "Hadir",
        correctionNote: editTarget?.correctionNote || "",
      });
    }
  }, [isOpen, editTarget, reset, defaultStudent?.name, defaultDudiName]);

  if (!isOpen) return null;

  const onSubmit = async (data: AttendanceFormValues) => {
    try {
      if (editTarget) {
        await updateAttendanceRecord(editTarget.id, {
          ...data,
          timeOut: data.timeOut || undefined,
          correctionNote: data.correctionNote || undefined,
        });
      } else {
        const student = students.find((s) => s.name === data.studentName);
        await addAttendanceRecord({
          studentId: student?.id || `std-${Date.now()}`,
          studentName: data.studentName,
          dudiName: data.dudiName,
          date: data.date,
          timeIn: data.timeIn,
          timeOut: data.timeOut || undefined,
          status: data.status,
          correctionNote: data.correctionNote || undefined,
        });
      }
      reset();
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <FocusLock>
      <div 
        className="fixed inset-0 z-50 bg-[var(--modal-overlay)] flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="w-full max-w-md bg-[var(--modal-bg)] border border-[var(--modal-border)] rounded-2xl p-6 shadow-2xl relative">
          <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-[var(--surface-alt)] text-[var(--card-subtitle)] cursor-pointer transition">
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${editTarget ? 'bg-[var(--badge-warning-bg)]' : 'bg-[var(--badge-info-bg)]'}`}>
              {editTarget ? <AlertTriangle className="w-5 h-5 text-[var(--badge-warning-text)]" /> : <Clock className="w-5 h-5 text-[var(--badge-info-text)]" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--foreground)]">
                {editTarget ? "Koreksi Absensi" : "Catat Absensi"}
              </h3>
              <p className="text-xs text-[var(--card-subtitle)]">
                {editTarget ? "Ubah data absensi dan berikan catatan." : "Catat data absensi harian manual."}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-[13px]">
            {isAdmin && !editTarget && (
              <div>
                <label className="block font-semibold mb-1.5 text-[var(--foreground)]">Nama Siswa</label>
                <select
                  {...register("studentName")}
                  className={`w-full h-10 token-input px-3 text-sm ${errors.studentName ? 'border-red-500 focus:ring-red-500' : ''}`}
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.name}>{s.name} ({s.class})</option>
                  ))}
                </select>
                {errors.studentName && <p className="text-red-500 text-xs mt-1">{errors.studentName.message}</p>}
              </div>
            )}
            {editTarget && (
               <div>
                <label className="block font-semibold mb-1.5 text-[var(--foreground)]">Nama Siswa</label>
                <input
                  type="text"
                  {...register("studentName")}
                  className="w-full h-10 token-input px-3 text-sm bg-gray-50 dark:bg-gray-800"
                  readOnly={!isAdmin}
                />
               </div>
            )}

            <div>
              <label className="block font-semibold mb-1.5 text-[var(--foreground)]">Perusahaan DUDI</label>
              <input
                type="text"
                {...register("dudiName")}
                className="w-full h-10 token-input px-3 text-sm bg-gray-50 dark:bg-gray-800"
                readOnly
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1.5 text-[var(--foreground)]">Tanggal</label>
                <input
                  type="date"
                  {...register("date")}
                  className={`w-full h-10 token-input px-3 text-sm ${errors.date ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
                {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
              </div>
              <div>
                <label className="block font-semibold mb-1.5 text-[var(--foreground)]">Status</label>
                <select
                  {...register("status")}
                  className="w-full h-10 token-input px-3 text-sm font-semibold"
                >
                  <option value="Hadir">Hadir</option>
                  <option value="Terlambat">Terlambat</option>
                  <option value="Izin">Izin</option>
                  <option value="Sakit">Sakit</option>
                  <option value="Tidak Hadir">Tidak Hadir</option>
                  <option value="Anomali">Anomali</option>
                  <option value="Alpa">Alpa</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1.5 text-[var(--foreground)]">Jam Masuk</label>
                <input
                  type="time"
                  {...register("timeIn")}
                  className={`w-full h-10 token-input px-3 text-sm ${errors.timeIn ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
                {errors.timeIn && <p className="text-red-500 text-xs mt-1">{errors.timeIn.message}</p>}
              </div>
              <div>
                <label className="block font-semibold mb-1.5 text-[var(--foreground)]">Jam Keluar (Opsional)</label>
                <input
                  type="time"
                  {...register("timeOut")}
                  className="w-full h-10 token-input px-3 text-sm"
                />
              </div>
            </div>

            {editTarget && (
              <div>
                <label className="block font-semibold mb-1.5 text-[var(--foreground)]">Catatan Koreksi (Opsional)</label>
                <input
                  type="text"
                  {...register("correctionNote")}
                  placeholder="Contoh: Lupa absen pulang, dikoreksi manual."
                  className="w-full h-10 token-input px-3 text-sm"
                />
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 h-10 rounded-lg border border-[var(--input-border)] text-[var(--foreground)] font-semibold hover:bg-[var(--surface-alt)] transition cursor-pointer text-sm"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 h-10 rounded-lg bg-[var(--btn-primary-bg)] hover:bg-[var(--btn-primary-hover)] text-white font-semibold shadow-sm transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
              >
                {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : "Simpan Absensi"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </FocusLock>
  );
}
