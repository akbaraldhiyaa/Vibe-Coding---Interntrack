"use client";

import { useInternTrackStore } from "@/shared/store/useInternTrackStore";
import { Check, Trash2, BellOff, CheckCheck } from "lucide-react";

export default function NotifikasiView() {
  const {
    notifications,
    markAllNotificationsAsRead,
    deleteNotification,
  } = useInternTrackStore();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6 max-w-full">
      {/* ─── PAGE HEADER ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--foreground)]">
            Notifikasi
          </h1>
          <p className="text-[13px] text-[var(--card-subtitle)] font-normal">
            {unreadCount} pemberitahuan belum dibaca
          </p>
        </div>

        <button
          onClick={markAllNotificationsAsRead}
          disabled={unreadCount === 0}
          className="h-9 px-4 rounded-lg bg-[var(--surface-alt)] hover:bg-[var(--sidebar-hover)] border border-[var(--input-border)] text-[var(--foreground)] text-[12px] font-semibold flex items-center gap-2 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Tandai semua dibaca</span>
        </button>
      </div>

      {/* ─── NOTIFICATION LIST ─────────────────────────────────────── */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] overflow-hidden">
        {notifications.length === 0 ? (
          <div className="py-16 text-center">
            <BellOff className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-sm font-semibold text-[var(--foreground)] mb-1">
              Belum ada notifikasi
            </p>
            <p className="text-xs text-[var(--card-subtitle)]">
              Semua pemberitahuan akan muncul di sini.
            </p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-[var(--table-border)]">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 sm:p-5 flex items-start gap-3 sm:gap-4 transition-colors hover:bg-[var(--table-hover-bg)] group ${
                  !notification.isRead ? "bg-[var(--table-hover-bg)]/50" : ""
                }`}
              >
                {/* Unread Indicator */}
                <div className="pt-1.5 shrink-0 w-2.5 flex justify-center">
                  {!notification.isRead && (
                    <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  <h4 className="text-sm font-bold text-[var(--foreground)] truncate">
                    {notification.title}
                  </h4>
                  <p className="text-[13px] text-[var(--card-subtitle)] leading-relaxed">
                    {notification.message}
                  </p>
                  <span className="text-[11px] text-[var(--input-placeholder)] mt-1 block">
                    {notification.timestamp}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  {!notification.isRead && (
                    <button
                      onClick={() => {
                        useInternTrackStore.setState((state) => ({
                          notifications: state.notifications.map((n) =>
                            n.id === notification.id ? { ...n, isRead: true } : n
                          ),
                        }));
                      }}
                      title="Tandai dibaca"
                      className="p-2 rounded-lg text-slate-600 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/30 transition cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    title="Hapus notifikasi"
                    className="p-2 rounded-lg text-slate-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
