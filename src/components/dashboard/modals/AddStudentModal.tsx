"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { studentSchema, StudentFormValues } from "@/shared/validations";
import { useInternTrackStore } from "@/shared/store/useInternTrackStore";
import { X, Loader2 } from "lucide-react";
import FocusLock from "react-focus-lock";

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  editTarget?: any;
}

export default function AddStudentModal({ isOpen, onClose, editTarget }: AddStudentModalProps) {
  const { addStudent, updateStudent, dudiList } = useInternTrackStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: editTarget?.name || "",
      nisn: editTarget?.nisn || "",
      class: editTarget?.class || "",
      department: editTarget?.department || "",
      dudiName: editTarget?.dudiName || "",
    },
  });

  if (!isOpen) return null;

  const onSubmit = async (data: StudentFormValues) => {
    try {
      if (editTarget) {
        await updateStudent(editTarget.id, data);
      } else {
        await addStudent(data as any); // cast needed due to types but it's safe
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
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div className="w-full max-w-md bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>

          <h3 className="text-lg font-bold text-[var(--card-title)] mb-1">
            {editTarget ? "Edit Data Siswa PKL" : "Tambah Siswa Baru"}
          </h3>
          <p className="text-xs text-[var(--card-subtitle)] mb-4">
            Isi formulir data induk siswa PKL untuk dipasangkan ke mitra DUDI.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-[var(--foreground)] mb-1">
                Nama Lengkap Siswa <span className="text-red-500">*</span>
              </label>
              <input
                {...register("name")}
                placeholder="Contoh: Muhammad Farhan"
                className={`w-full token-input p-2.5 ${errors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
              />
              {errors.name && <p className="text-red-500 mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block font-semibold text-[var(--foreground)] mb-1">
                NISN <span className="text-red-500">*</span>
              </label>
              <input
                {...register("nisn")}
                placeholder="Contoh: 0054819299"
                className={`w-full token-input p-2.5 ${errors.nisn ? 'border-red-500 focus:ring-red-500' : ''}`}
              />
              {errors.nisn && <p className="text-red-500 mt-1">{errors.nisn.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[var(--foreground)] mb-1">Kelas <span className="text-red-500">*</span></label>
                <input
                  {...register("class")}
                  className={`w-full token-input p-2.5 ${errors.class ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
                {errors.class && <p className="text-red-500 mt-1">{errors.class.message}</p>}
              </div>

              <div>
                <label className="block font-semibold text-[var(--foreground)] mb-1">Jurusan <span className="text-red-500">*</span></label>
                <input
                  {...register("department")}
                  className={`w-full token-input p-2.5 ${errors.department ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
                {errors.department && <p className="text-red-500 mt-1">{errors.department.message}</p>}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[var(--foreground)] mb-1">
                Penempatan DUDI
              </label>
              <select
                {...register("dudiName")}
                className="w-full token-input p-2.5"
              >
                <option value="">-- Belum Ditempatkan --</option>
                {dudiList.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition font-medium"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting && <Loader2 className="w-3 h-3 animate-spin" />}
                {editTarget ? "Simpan Perubahan" : "Simpan Data Siswa"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </FocusLock>
  );
}
