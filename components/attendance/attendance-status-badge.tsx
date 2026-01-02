import type { AttendanceStatus } from "@/types/attendance";

const statusConfig: Record<
  AttendanceStatus,
  { label: string; className: string }
> = {
  present: {
    label: "Présent",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  absent: {
    label: "Absent",
    className: "bg-rose-50 text-rose-700 border-rose-200",
  },
  late: {
    label: "En retard",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  excused: {
    label: "Excusé",
    className: "bg-slate-50 text-slate-700 border-slate-200",
  },
};

interface AttendanceStatusBadgeProps {
  status: AttendanceStatus;
  className?: string;
}

export default function AttendanceStatusBadge({
  status,
  className = "",
}: AttendanceStatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${config.className} ${className}`}
    >
      {config.label}
    </span>
  );
}
