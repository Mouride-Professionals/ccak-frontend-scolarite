import type { DayOfWeek, Schedule } from "@/types/calendar";

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
}

const formatTime = (value?: string) => (value ? value.slice(0, 5) : "");

export default function ScheduleGrid({
  schedules,
  isLoading = false,
  emptyMessage = "Aucune séance disponible.",
}: ScheduleGridProps) {
  if (isLoading) {
    return <div className="rounded-lg border border-zinc-200 bg-white p-6 text-sm text-zinc-500">Chargement...</div>;
  }

  if (!schedules.length) {
    return <div className="rounded-lg border border-zinc-200 bg-white p-6 text-sm text-zinc-500">{emptyMessage}</div>;
  }

  return (
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
                    className="rounded-lg border border-zinc-200 bg-zinc-50/50 p-3 text-xs text-zinc-600"
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
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
