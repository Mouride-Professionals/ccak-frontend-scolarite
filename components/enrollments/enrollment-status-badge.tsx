import { EnrollmentStatus } from "@/types/enrollment";

interface EnrollmentStatusBadgeProps {
  status: EnrollmentStatus;
}

export default function EnrollmentStatusBadge({ status }: EnrollmentStatusBadgeProps) {
  const getStatusStyles = () => {
    switch (status) {
      case EnrollmentStatus.PENDING:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case EnrollmentStatus.REGISTERED:
        return "bg-blue-100 text-blue-800 border-blue-200";
      case EnrollmentStatus.ACTIVE:
        return "bg-green-100 text-green-800 border-green-200";
      case EnrollmentStatus.COMPLETED:
        return "bg-blue-100 text-blue-800 border-blue-200";
      case EnrollmentStatus.WITHDRAWN:
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-zinc-100 text-zinc-800 border-zinc-200";
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case EnrollmentStatus.PENDING:
        return "En attente";
      case EnrollmentStatus.REGISTERED:
        return "Enregistrée";
      case EnrollmentStatus.ACTIVE:
        return "Active";
      case EnrollmentStatus.COMPLETED:
        return "Terminée";
      case EnrollmentStatus.WITHDRAWN:
        return "Retirée";
      default:
        return status;
    }
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusStyles()}`}
    >
      {getStatusLabel()}
    </span>
  );
}
