import { RegistrationStatus } from "@/types/enrollment";

interface EnrollmentStatusBadgeProps {
  status: RegistrationStatus;
}

export default function EnrollmentStatusBadge({ status }: EnrollmentStatusBadgeProps) {
  const getStatusStyles = () => {
    switch (status) {
      case RegistrationStatus.DRAFT:
        return "bg-zinc-100 text-zinc-800 border-zinc-200";
      case RegistrationStatus.PENDING_VALIDATION:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case RegistrationStatus.VALIDATED:
        return "bg-green-100 text-green-800 border-green-200";
      case RegistrationStatus.SUSPENDED:
        return "bg-orange-100 text-orange-800 border-orange-200";
      case RegistrationStatus.CANCELLED:
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-zinc-100 text-zinc-800 border-zinc-200";
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case RegistrationStatus.DRAFT:
        return "Brouillon";
      case RegistrationStatus.PENDING_VALIDATION:
        return "En attente";
      case RegistrationStatus.VALIDATED:
        return "Validée";
      case RegistrationStatus.SUSPENDED:
        return "Suspendue";
      case RegistrationStatus.CANCELLED:
        return "Annulée";
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
