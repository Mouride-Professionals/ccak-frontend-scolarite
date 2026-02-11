import type { DayOfWeek, Schedule } from "@/types/calendar";
import type { ReactNode } from "react";

const dayOrder: DayOfWeek[] = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const dayLabels: Record<DayOfWeek, string> = {
  MON: "Lundi",
  TUE: "Mardi",
  WED: "Mercredi",
  THU: "Jeudi",
  FRI: "Vendredi",
  SAT: "Samedi",
  SUN: "Dimanche",
};

interface ScheduleGridProps {
  schedules: Schedule[];
  isLoading?: boolean;
  emptyMessage?: string;
  showLegend?: boolean;
  renderActions?: (schedule: Schedule) => ReactNode;
}

const formatTime = (value?: string) => (value ? value.slice(0, 5) : "");

const getActivityStyles = (activity?: string) => {
  const normalized = (activity || "").toLowerCase();

  if (normalized.includes("td")) {
    return "border-l-4 border-l-[#2E7CFF] bg-[#2E7CFF]/5";
  }
  if (normalized.includes("tp") || normalized.includes("lab")) {
    return "border-l-4 border-l-[#0A8F3D] bg-[#0A8F3D]/5";
  }
  if (normalized.includes("cm") || normalized.includes("cours")) {
    return "border-l-4 border-l-[#00365F] bg-[#00365F]/5";
  }
  return "border-l-4 border-l-[#F59E0B] bg-[#F59E0B]/10";
};

export default function ScheduleGrid({
  schedules,
  isLoading = false,
  emptyMessage = "Aucune séance disponible.",
  showLegend = false,
  renderActions,
}: ScheduleGridProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-6 text-sm text-zinc-500">
        Chargement...
      </div>
    );
  }

  if (!schedules.length) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-6 text-sm text-zinc-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showLegend && (
        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-600">
          <span className="rounded-full bg-[#00365F]/10 px-2 py-1 text-[#00365F]">CM / Cours</span>
          <span className="rounded-full bg-[#2E7CFF]/10 px-2 py-1 text-[#2E7CFF]">TD</span>
          <span className="rounded-full bg-[#0A8F3D]/10 px-2 py-1 text-[#0A8F3D]">TP / Labo</span>
          <span className="rounded-full bg-[#F59E0B]/10 px-2 py-1 text-[#A35D00]">Autre</span>
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-7">
        {dayOrder.map((day) => {
          const items = schedules.filter((schedule) => schedule.day_of_week === day);
          return (
            <div key={day} className="rounded-lg border border-zinc-200 bg-white p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-[#00365F]">
                {dayLabels[day]}
              </div>
              <div className="mt-3 space-y-3">
                {items.length === 0 ? (
                  <div className="text-xs text-zinc-400">Aucune séance</div>
                ) : (
                  items.map((item) => (
                    <div
                      key={item.id}
                      className={`rounded-lg border border-zinc-200 p-3 text-xs text-zinc-600 ${getActivityStyles(
                        item.activity_type_name
                      )}`}
                    >
                      <div className="font-semibold text-[#00365F]">
                        {formatTime(item.start_time)} - {formatTime(item.end_time)}
                      </div>
                      <div className="mt-1 text-sm font-medium text-zinc-800">
                        {item.course_name || item.course_id}
                      </div>
                      <div className="mt-1">
                        {item.activity_type_name || "Activité"} · {item.room_name || item.room_id}
                      </div>
                      <div className="text-zinc-500">
                        {item.faculty_name || item.faculty_member_id}
                      </div>
                      {renderActions ? <div className="mt-2">{renderActions(item)}</div> : null}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
