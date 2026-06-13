"use client";

import type { SearchResultType, SearchResultItem } from "@/types/search";
import SearchResultItemComponent from "./SearchResultItem";

const GROUP_LABELS: Record<SearchResultType, string> = {
  student: "Étudiants",
  faculty_member: "Enseignants",
  course: "ECUE (Cours)",
  course_unit: "UE",
  academic_program: "Programmes",
  department: "Départements",
  faculty: "Facultés",
  exam_session: "Sessions d'examen",
};

interface Props {
  type: SearchResultType;
  items: SearchResultItem[];
  activeId: string | null;
  onSelect: (item: SearchResultItem) => void;
}

export default function SearchResultGroup({ type, items, activeId, onSelect }: Props) {
  return (
    <div>
      <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-400">
        {GROUP_LABELS[type] ?? type}
      </div>
      <div className="space-y-0.5 px-2">
        {items.map((item) => (
          <SearchResultItemComponent
            key={item.id}
            item={item}
            isActive={activeId === item.id}
            onClick={() => onSelect(item)}
          />
        ))}
      </div>
    </div>
  );
}
