"use client";

import { useState } from "react";
import { AlertTriangle, Trash2, Loader2 } from "lucide-react";
import { deleteMyAccount } from "@/app/actions/auth";
import { signOut, useSession } from "next-auth/react";
import { useInternTrackStore } from "@/shared/store/useInternTrackStore";

interface DeleteAccountSectionProps {
  currentEmail?: string;
}

export default function DeleteAccountSection({ currentEmail }: DeleteAccountSectionProps) {
  const { data: session } = useSession();
  const { addToast, clearUser, userProfile } = useInternTrackStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Authenticated user's email resolved from props, session, or zustand profile
  const authenticatedEmail = (
    currentEmail ||
    session?.user?.email ||
    userProfile?.email ||
    ""
  ).trim();

  const trimmedInput = confirmationEmail.trim();
  const isEmailMatch =
    authenticatedEmail.length > 0 &&
    trimmedInput.length > 0 &&
    trimmedInput.toLowerCase() === authenticatedEmail.toLowerCase();

  const handleDelete = async () => {
    setErrorMessage("");

    if (!isEmailMatch) {
      const msg = "Email tidak sesuai dengan akun yang sedang digunakan.";
      setErrorMessage(msg);
      addToast({
        type: "error",
        title: "Konfirmasi Gagal",
        message: msg,
      });
      return;
    }

    setIsDeleting(true);
    try {
      const res = await deleteMyAccount();
      if (res.success) {
        addToast({
          type: "success",
          title: "Berhasil",
          message: "Akun berhasil dihapus.",
        });
        clearUser();
        await signOut({ callbackUrl: "/login" });
      } else {
        addToast({
          type: "error",
          title: "Gagal Menghapus Akun",
          message: res.error || "Gagal menghapus akun.",
        });
        setIsDeleting(false);
      }
    } catch (error: any) {
      addToast({
        type: "error",
        title: "Kesalahan",
        message: "Terjadi kesalahan saat menghapus akun.",
      });
      setIsDeleting(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setConfirmationEmail("");
    setErrorMessage("");
  };

  return (
    <>
      {/* ZONA BERBAHAYA */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[var(--card-bg)] border border-red-200 dark:border-red-900/50 shadow-[var(--card-shadow)] space-y-4">
        <h2 className="text-base font-bold text-red-600 dark:text-red-400 border-b border-red-200 dark:border-red-900/50 pb-3 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Zona Berbahaya
        </h2>

        <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10 overflow-hidden">
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xs font-bold text-red-800 dark:text-red-400">Hapus Akun</h3>
              <p className="text-[11px] text-red-700 dark:text-red-300 mt-0.5">
                Menghapus akun dan data terkait secara permanen. Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setConfirmationEmail("");
                setErrorMessage("");
                setIsModalOpen(true);
              }}
              className="py-2 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-1.5 transition self-start sm:self-auto shrink-0"
            >
              <Trash2 className="w-4 h-4" />
              <span>Hapus Akun</span>
            </button>
          </div>
        </div>
      </div>

      {/* CONFIRMATION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-[var(--card-title)]">Hapus Akun Permanen?</h3>
            </div>

            <p className="text-sm text-[var(--card-subtitle)] mb-4">
              Semua data yang terkait dengan akun ini akan dihapus dan tindakan ini{" "}
              <strong className="text-red-600 dark:text-red-400">tidak dapat dibatalkan</strong>.
            </p>

            <div className="mb-6">
              <label
                htmlFor="confirm-delete-email"
                className="block text-xs font-semibold text-[var(--foreground)] mb-2"
              >
                Ketik email akun kamu untuk melanjutkan:
              </label>
              <input
                id="confirm-delete-email"
                type="email"
                autoComplete="off"
                value={confirmationEmail}
                onChange={(e) => {
                  setConfirmationEmail(e.target.value);
                  if (errorMessage) setErrorMessage("");
                }}
                placeholder="Masukkan email akun"
                className={`w-full token-input px-3 py-2 text-sm ${
                  errorMessage
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                    : "border-red-200 dark:border-red-900/50 focus:border-red-500 focus:ring-red-500/20"
                }`}
              />
              {errorMessage && (
                <p className="text-[11px] text-red-500 font-medium mt-1.5">{errorMessage}</p>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={isDeleting}
                className="py-2 px-4 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting || !isEmailMatch}
                className="py-2 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>{isDeleting ? "Menghapus..." : "Hapus Akun Permanen"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
