import { GradeStatus } from "@/types/grade";

interface GradeStatusBadgeProps {
  status: GradeStatus | string;
  className?: string;
}

const statusConfig = {
  [GradeStatus.DRAFT]: {
    label: "Brouillon",
    dotColor: "bg-zinc-400",
    textColor: "text-zinc-700",
    bgColor: "bg-zinc-50",
  },
  [GradeStatus.SUBMITTED]: {
    label: "Soumise",
    dotColor: "bg-amber-500",
    textColor: "text-zinc-700",
    bgColor: "bg-amber-50",
  },
  [GradeStatus.VALIDATED]: {
    label: "Validée",
    dotColor: "bg-[#008D36]",
    textColor: "text-zinc-700",
    bgColor: "bg-green-50",
  },
  [GradeStatus.PUBLISHED]: {
    label: "Publiée",
    dotColor: "bg-blue-500",
    textColor: "text-zinc-700",
    bgColor: "bg-blue-50",
  },
};

export default function GradeStatusBadge({ status, className = "" }: GradeStatusBadgeProps) {
  const config =
    statusConfig[status as keyof typeof statusConfig] || statusConfig[GradeStatus.DRAFT];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${config.bgColor} ${config.textColor} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dotColor}`} />
      {config.label}
    </span>
  );
}
