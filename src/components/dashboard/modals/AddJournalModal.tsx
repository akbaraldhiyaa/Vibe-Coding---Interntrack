"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { journalSchema, JournalFormValues } from "@/shared/validations";
import { useInternTrackStore, JournalEntry } from "@/shared/store/useInternTrackStore";
import { X, Loader2 } from "lucide-react";
import FocusLock from "react-focus-lock";

interface AddJournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  editTarget?: JournalEntry | null;
  isAdmin?: boolean;
}

export default function AddJournalModal({ isOpen, onClose, editTarget, isAdmin }: AddJournalModalProps) {
  const { addJournalEntry, updateJournalEntry, students, dudiList } = useInternTrackStore();

  const defaultStudent = students[0];
  const defaultDudiName = dudiList.find((d) => d.name === defaultStudent?.dudiName)?.name || dudiList[0]?.name || "";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<JournalFormValues>({
    resolver: zodResolver(journalSchema),
    defaultValues: {
      studentName: editTarget?.studentName || defaultStudent?.name || "",
      dudiName: editTarget?.dudiName || defaultDudiName,
      date: editTarget?.date || new Date().toISOString().split("T")[0],
      workHours: editTarget?.workHours || 8,
      title: editTarget?.title || "",
      description: editTarget?.description || "",
      status: editTarget?.status || "Menunggu verifikasi",
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
        workHours: editTarget?.workHours || 8,
        title: editTarget?.title || "",
        description: editTarget?.description || "",
        status: editTarget?.status || "Menunggu verifikasi",
      });
    }
  }, [isOpen, editTarget, reset, defaultStudent?.name, defaultDudiName]);

  if (!isOpen) return null;

  const onSubmit = async (data: JournalFormValues) => {
    try {
      if (editTarget) {
        await updateJournalEntry(editTarget.id, {
          ...data,
          status: data.status || editTarget.status,
        });
      } else {
        const student = students.find((s) => s.name === data.studentName);
        await addJournalEntry({
          studentId: student?.id || `std-${Date.now()}`,
          studentName: data.studentName,
          dudiName: data.dudiName,
          date: data.date,
          workHours: data.workHours,
          title: data.title,
          description: data.description,
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
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div className="w-full max-w-lg bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 relative my-8">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>

          <h3 className="text-lg font-bold text-[var(--card-title)] mb-1">
            {editTarget ? "Edit Jurnal Harian" : "Isi Jurnal Harian"}
          </h3>
          <p className="text-xs text-[var(--card-subtitle)] mb-5">
            Catat aktivitas dan tugas yang dikerjakan selama PKL.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-sm">
            {/* Hanya tampilkan pemilihan siswa jika Admin yang menginput */}
            {isAdmin && (
              <div>
                <label className="block font-semibold text-[var(--foreground)] mb-1.5 text-xs">
                  Siswa (Admin Mode)
                </label>
                <select
                  {...register("studentName")}
                  className={`w-full token-input p-2.5 text-xs ${errors.studentName ? 'border-red-500 focus:ring-red-500' : ''}`}
                >
                  <option value="">-- Pilih Siswa --</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} ({s.dudiName})
                    </option>
                  ))}
                </select>
                {errors.studentName && <p className="text-red-500 text-xs mt-1">{errors.studentName.message}</p>}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-[var(--foreground)] mb-1.5 text-xs">
                  Tanggal Kegiatan <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  {...register("date")}
                  className={`w-full token-input p-2.5 text-xs ${errors.date ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
                {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
              </div>
              <div>
                <label className="block font-semibold text-[var(--foreground)] mb-1.5 text-xs">
                  Durasi (Jam) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  {...register("workHours", { valueAsNumber: true })}
                  className={`w-full token-input p-2.5 text-xs ${errors.workHours ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
                {errors.workHours && <p className="text-red-500 text-xs mt-1">{errors.workHours.message}</p>}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[var(--foreground)] mb-1.5 text-xs">
                Judul Aktivitas <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("title")}
                placeholder="Contoh: Setup Jaringan LAN"
                className={`w-full token-input p-2.5 text-xs ${errors.title ? 'border-red-500 focus:ring-red-500' : ''}`}
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block font-semibold text-[var(--foreground)] mb-1.5 text-xs">
                Deskripsi Pekerjaan <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register("description")}
                placeholder="Ceritakan detail apa saja yang Anda kerjakan hari ini..."
                className={`w-full token-input p-2.5 h-28 resize-none text-xs leading-relaxed ${errors.description ? 'border-red-500 focus:ring-red-500' : ''}`}
              />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
            </div>

            {isAdmin && editTarget && (
              <div>
                <label className="block font-semibold text-[var(--foreground)] mb-1.5 text-xs">
                  Status Jurnal
                </label>
                <select
                  {...register("status")}
                  className="w-full token-input p-2.5 text-xs"
                >
                  <option value="Menunggu verifikasi">Menunggu verifikasi</option>
                  <option value="Terverifikasi">Terverifikasi</option>
                  <option value="Perlu revisi">Perlu revisi</option>
                </select>
              </div>
            )}

            <div className="pt-4 flex items-center justify-end gap-2 border-t border-[var(--card-border)]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition font-medium text-xs"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition font-semibold disabled:opacity-50 flex items-center gap-2 shadow-sm text-xs"
              >
                {isSubmitting && <Loader2 className="w-3 h-3 animate-spin" />}
                {editTarget ? "Simpan Perubahan" : "Kirim Jurnal"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </FocusLock>
  );
}
