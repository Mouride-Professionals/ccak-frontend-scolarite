import { DeliberationStatus } from "@/types/deliberation";

interface DeliberationStatusBadgeProps {
  status: DeliberationStatus;
  className?: string;
}

const statusConfig = {
  [DeliberationStatus.SCHEDULED]: {
    label: "Programmée",
    dotColor: "bg-blue-500",
    textColor: "text-zinc-700",
    bgColor: "bg-blue-50",
  },
  [DeliberationStatus.IN_PROGRESS]: {
    label: "En cours",
    dotColor: "bg-amber-500",
    textColor: "text-zinc-700",
    bgColor: "bg-amber-50",
  },
  [DeliberationStatus.COMPLETED]: {
    label: "Terminée",
    dotColor: "bg-[#008D36]",
    textColor: "text-zinc-700",
    bgColor: "bg-green-50",
  },
  [DeliberationStatus.CLOSED]: {
    label: "Clôturée",
    dotColor: "bg-zinc-400",
    textColor: "text-zinc-700",
    bgColor: "bg-zinc-50",
  },
};

export default function DeliberationStatusBadge({
  status,
  className = "",
}: DeliberationStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${config.bgColor} ${config.textColor} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dotColor}`} />
      {config.label}
    </span>
  );
}
