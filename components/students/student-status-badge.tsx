import { StudentStatus } from "@/types/student";

interface StudentStatusBadgeProps {
  status: StudentStatus;
  className?: string;
}

const statusConfig = {
  [StudentStatus.ACTIVE]: {
    label: "Actif",
    dotColor: "bg-[#008D36]",
    textColor: "text-zinc-700",
    bgColor: "bg-green-50",
  },
  [StudentStatus.SUSPENDED]: {
    label: "Suspendu",
    dotColor: "bg-amber-500",
    textColor: "text-zinc-700",
    bgColor: "bg-amber-50",
  },
  [StudentStatus.GRADUATED]: {
    label: "Diplômé",
    dotColor: "bg-blue-500",
    textColor: "text-zinc-700",
    bgColor: "bg-blue-50",
  },
  [StudentStatus.WITHDRAWN]: {
    label: "Désisté",
    dotColor: "bg-zinc-400",
    textColor: "text-zinc-700",
    bgColor: "bg-zinc-50",
  },
  [StudentStatus.EXPELLED]: {
    label: "Exclu",
    dotColor: "bg-red-500",
    textColor: "text-zinc-700",
    bgColor: "bg-red-50",
  },
};

export default function StudentStatusBadge({ status, className = "" }: StudentStatusBadgeProps) {
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
