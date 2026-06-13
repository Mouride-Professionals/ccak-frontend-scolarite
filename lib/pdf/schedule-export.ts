import type { Schedule } from "@/types/calendar";

interface SchedulePdfOptions {
  title: string;
  subtitle?: string;
  fileName?: string;
}

const dayRank: Record<string, number> = {
  MON: 1,
  TUE: 2,
  WED: 3,
  THU: 4,
  FRI: 5,
  SAT: 6,
  SUN: 7,
};

export async function exportSchedulesToPdf(
  schedules: Schedule[],
  options: SchedulePdfOptions
): Promise<void> {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text(options.title, 14, 16);

  if (options.subtitle) {
    doc.setFontSize(10);
    doc.text(options.subtitle, 14, 23);
  }

  const rows = schedules
    .slice()
    .sort((a, b) => {
      if (a.day_of_week === b.day_of_week) {
        return a.start_time.localeCompare(b.start_time);
      }
      return (dayRank[a.day_of_week] || 99) - (dayRank[b.day_of_week] || 99);
    })
    .map((item) => [
      item.day_of_week,
      `${item.start_time.slice(0, 5)} - ${item.end_time.slice(0, 5)}`,
      item.course_name || item.course_id,
      item.activity_type_name || "Activité",
      item.room_name || item.room_id,
      item.faculty_name || item.faculty_member_id,
    ]);

  autoTable(doc, {
    startY: options.subtitle ? 28 : 22,
    head: [["Jour", "Créneau", "Cours", "Type", "Salle", "Enseignant"]],
    body: rows,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [0, 54, 95] },
  });

  doc.save(options.fileName || "emploi-du-temps.pdf");
}
