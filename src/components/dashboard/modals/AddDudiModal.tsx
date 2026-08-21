"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { dudiSchema, DudiFormValues } from "@/shared/validations";
import { useInternTrackStore } from "@/shared/store/useInternTrackStore";
import { X, Loader2 } from "lucide-react";
import FocusLock from "react-focus-lock";

interface AddDudiModalProps {
  isOpen: boolean;
  onClose: () => void;
  editTarget?: any;
}

export default function AddDudiModal({ isOpen, onClose, editTarget }: AddDudiModalProps) {
  const { addDudi, updateDudi } = useInternTrackStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<DudiFormValues>({
    resolver: zodResolver(dudiSchema),
    defaultValues: {
      name: editTarget?.name || "",
      address: editTarget?.address || "",
      industrySupervisor: editTarget?.industrySupervisor || "",
      quota: editTarget?.quota || 1,
    },
  });

  if (!isOpen) return null;

  const onSubmit = async (data: DudiFormValues) => {
    try {
      if (editTarget) {
        await updateDudi(editTarget.id, data);
      } else {
        await addDudi({
          name: data.name,
          address: data.address,
          industrySupervisor: data.industrySupervisor,
          quota: data.quota,
          activeStudents: editTarget?.activeStudents || 0,
          qrCode: editTarget?.qrCode || "",
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
            {editTarget ? "Edit Mitra DUDI" : "Tambah Mitra DUDI Baru"}
          </h3>
          <p className="text-xs text-[var(--card-subtitle)] mb-4">
            Tambahkan perusahaan atau instansi baru sebagai tempat pelaksanaan PKL.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-[var(--foreground)] mb-1">
                Nama Perusahaan <span className="text-red-500">*</span>
              </label>
              <input
                {...register("name")}
                placeholder="Contoh: PT Sinar Data Nusantara"
                className={`w-full token-input p-2.5 ${errors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
              />
              {errors.name && <p className="text-red-500 mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block font-semibold text-[var(--foreground)] mb-1">
                Alamat Lengkap <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register("address")}
                placeholder="Alamat lengkap perusahaan..."
                className={`w-full token-input p-2.5 h-20 resize-none ${errors.address ? 'border-red-500 focus:ring-red-500' : ''}`}
              />
              {errors.address && <p className="text-red-500 mt-1">{errors.address.message}</p>}
            </div>

            <div>
              <label className="block font-semibold text-[var(--foreground)] mb-1">
                Nama Pembimbing Industri <span className="text-red-500">*</span>
              </label>
              <input
                {...register("industrySupervisor")}
                placeholder="Contoh: Bpk. Budi Santoso"
                className={`w-full token-input p-2.5 ${errors.industrySupervisor ? 'border-red-500 focus:ring-red-500' : ''}`}
              />
              {errors.industrySupervisor && <p className="text-red-500 mt-1">{errors.industrySupervisor.message}</p>}
            </div>

            <div>
              <label className="block font-semibold text-[var(--foreground)] mb-1">
                Kuota Maksimal Siswa <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                {...register("quota", { valueAsNumber: true })}
                className={`w-full token-input p-2.5 ${errors.quota ? 'border-red-500 focus:ring-red-500' : ''}`}
              />
              {errors.quota && <p className="text-red-500 mt-1">{errors.quota.message}</p>}
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
                {editTarget ? "Simpan Perubahan" : "Tambahkan Mitra"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </FocusLock>
  );
}
