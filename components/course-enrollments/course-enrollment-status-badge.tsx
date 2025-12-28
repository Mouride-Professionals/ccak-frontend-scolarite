import { CourseEnrollmentStatus } from "@/types/course-enrollment";

interface CourseEnrollmentStatusBadgeProps {
  status: CourseEnrollmentStatus;
}

export default function CourseEnrollmentStatusBadge({ status }: CourseEnrollmentStatusBadgeProps) {
  const getStatusStyles = () => {
    switch (status) {
      case CourseEnrollmentStatus.ENROLLED:
        return "bg-blue-100 text-blue-800 border-blue-200";
      case CourseEnrollmentStatus.DROPPED:
        return "bg-red-100 text-red-800 border-red-200";
      case CourseEnrollmentStatus.COMPLETED:
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-zinc-100 text-zinc-800 border-zinc-200";
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case CourseEnrollmentStatus.ENROLLED:
        return "Inscrit";
      case CourseEnrollmentStatus.DROPPED:
        return "Abandon";
      case CourseEnrollmentStatus.COMPLETED:
        return "Terminé";
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
