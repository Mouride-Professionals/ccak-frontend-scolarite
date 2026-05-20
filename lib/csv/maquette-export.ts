import type { MaquetteProgram } from "@/types/maquette";

export function exportMaquetteCsv(programs: MaquetteProgram[]): void {
  const HEADER =
    "Programme,Semestre,Code UE,Nom UE,Type UE,Crédits UE,Coef UE,Code ECUE,Intitulé ECUE,CM,TD,TPE,VHT,Crédits ECUE,Coef ECUE\n";

  const escape = (v: string) =>
    v.includes(",") || v.includes('"') || v.includes("\n")
      ? `"${v.replace(/"/g, '""')}"`
      : v;

  const dataRows = programs.flatMap((prog) =>
    prog.semesters.flatMap((s) =>
      s.course_units.flatMap((unit) => {
        const courses = unit.courses ?? [];
        if (courses.length === 0) {
          return [
            [
              escape(prog.program_name),
              s.semester,
              escape(unit.code),
              escape(unit.name),
              unit.type,
              unit.credits ?? "",
              unit.coefficient ?? "",
              "", "", "", "", "", "", "", "",
            ].join(","),
          ];
        }
        return courses.map((c, i) => {
          const vht = c.vht ?? c.hours_lecture + c.hours_td + (c.hours_tpe ?? 0);
          return [
            i === 0 ? escape(prog.program_name) : "",
            i === 0 ? s.semester : "",
            i === 0 ? escape(unit.code) : "",
            i === 0 ? escape(unit.name) : "",
            i === 0 ? unit.type : "",
            i === 0 ? (unit.credits ?? "") : "",
            i === 0 ? (unit.coefficient ?? "") : "",
            escape(c.code),
            escape(c.name),
            c.hours_lecture,
            c.hours_td,
            c.hours_tpe ?? 0,
            vht,
            c.credits,
            c.coefficient,
          ].join(",");
        });
      })
    )
  );

  const csv = "\uFEFF" + HEADER + dataRows.join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const single = programs.length === 1 ? programs[0].program_name : null;
  const slug = single ? `-${single.toLowerCase().replace(/\s+/g, "-")}` : "";
  a.download = `maquette${slug}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
