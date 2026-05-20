import { ExamSessionStatus } from "@/types/exam";

const config: Record<ExamSessionStatus, { label: string; classes: string }> = {
  [ExamSessionStatus.DRAFT]: {
    label: "Brouillon",
    classes: "bg-zinc-100 text-zinc-700",
  },
  [ExamSessionStatus.PUBLISHED]: {
    label: "Publié",
    classes: "bg-green-100 text-green-700",
  },
  [ExamSessionStatus.CLOSED]: {
    label: "Clôturé",
    classes: "bg-zinc-200 text-zinc-500",
  },
};

export default function ExamSessionStatusBadge({ status }: { status: ExamSessionStatus }) {
  const { label, classes } = config[status] ?? config[ExamSessionStatus.DRAFT];
  return (
    <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ${classes}`}>
      {label}
    </span>
  );
}
