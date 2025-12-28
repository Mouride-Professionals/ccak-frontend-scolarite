import { DocumentStatus } from "@/types/document";

interface DocumentStatusBadgeProps {
  status: DocumentStatus;
  className?: string;
}

const statusConfig = {
  [DocumentStatus.DRAFT]: {
    label: "Brouillon",
    dotColor: "bg-zinc-500",
    textColor: "text-zinc-700",
    bgColor: "bg-zinc-100",
  },
  [DocumentStatus.ISSUED]: {
    label: "Émis",
    dotColor: "bg-[#008D36]",
    textColor: "text-green-700",
    bgColor: "bg-green-50",
  },
  [DocumentStatus.REVOKED]: {
    label: "Révoqué",
    dotColor: "bg-red-500",
    textColor: "text-red-700",
    bgColor: "bg-red-50",
  },
};

export default function DocumentStatusBadge({
  status,
  className = "",
}: DocumentStatusBadgeProps) {
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

