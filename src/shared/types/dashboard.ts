import { LucideIcon } from "lucide-react";

export type StudentStatusKey = "aktif" | "bermasalah" | "pembekalan" | "selesai";

export type StudentStatus = {
  key: StudentStatusKey;
  label: string;
  color: string;         // CSS class or token
  bgColor: string;
  icon: LucideIcon;      // Use Lucide React icons
  ariaLabel: string;     // For screen readers
};

export type AlertSeverity = "critical" | "warning" | "info" | "success";

export type AlertConfig = {
  severity: AlertSeverity;
  icon: LucideIcon;
  label: string;         // Human-readable, sentence case, no ALL-CAPS
};
