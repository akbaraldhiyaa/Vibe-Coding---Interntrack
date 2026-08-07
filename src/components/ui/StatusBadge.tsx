import React from 'react';
import { CheckCircle2, AlertCircle, GraduationCap, BookOpen } from 'lucide-react';
import { StudentStatus, StudentStatusKey } from '@/shared/types/dashboard';

const statusConfig: Record<StudentStatusKey, StudentStatus> = {
  aktif: {
    key: "aktif",
    label: "Aktif",
    color: "var(--status-active-text)",
    bgColor: "var(--status-active-bg)",
    icon: CheckCircle2,
    ariaLabel: "Status: Aktif",
  },
  bermasalah: {
    key: "bermasalah",
    label: "Bermasalah",
    color: "var(--status-problem-text)",
    bgColor: "var(--status-problem-bg)",
    icon: AlertCircle,
    ariaLabel: "Status: Bermasalah",
  },
  pembekalan: {
    key: "pembekalan",
    label: "Pembekalan",
    color: "var(--status-training-text)",
    bgColor: "var(--status-training-bg)",
    icon: BookOpen,
    ariaLabel: "Status: Pembekalan",
  },
  selesai: {
    key: "selesai",
    label: "Selesai",
    color: "var(--status-completed-text)",
    bgColor: "var(--status-completed-bg)",
    icon: GraduationCap,
    ariaLabel: "Status: Selesai",
  }
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const normalizedKey = status.toLowerCase() as StudentStatusKey;
  const config = statusConfig[normalizedKey];
  
  if (!config) {
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 ${className}`}>
        {status}
      </span>
    );
  }

  const Icon = config.icon;

  return (
    <span
      role="status"
      aria-label={`Status: ${config.label}`}
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border border-transparent ${className}`}
      style={{
        backgroundColor: config.bgColor,
        color: config.color,
      }}
    >
      <Icon size={12} aria-hidden="true" />
      <span>{config.label}</span>
    </span>
  );
}
