"use client";

import {
  GraduationCap,
  Users,
  BookOpen,
  Layers,
  BookMarked,
  Building2,
  University,
  ClipboardList,
} from "lucide-react";
import type { SearchResultItem as SearchResultItemType, SearchResultType } from "@/types/search";

const TYPE_ICONS: Record<SearchResultType, React.ComponentType<{ className?: string }>> = {
  student: GraduationCap,
  faculty_member: Users,
  course: BookOpen,
  course_unit: Layers,
  academic_program: BookMarked,
  department: Building2,
  faculty: University,
  exam_session: ClipboardList,
};

interface Props {
  item: SearchResultItemType;
  isActive: boolean;
  onClick: () => void;
}

export default function SearchResultItem({ item, isActive, onClick }: Props) {
  const Icon = TYPE_ICONS[item.type] ?? BookOpen;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
        isActive ? "bg-[#00365F] text-white" : "hover:bg-zinc-100 text-zinc-800"
      }`}
    >
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${
          isActive ? "bg-white/20" : "bg-zinc-100"
        }`}
      >
        <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-[#00365F]"}`} />
      </div>
      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm font-medium ${isActive ? "text-white" : "text-zinc-900"}`}>
          {item.label}
        </p>
        {item.sublabel && (
          <p className={`truncate text-xs ${isActive ? "text-white/70" : "text-zinc-500"}`}>
            {item.sublabel}
          </p>
        )}
      </div>
    </button>
  );
}
