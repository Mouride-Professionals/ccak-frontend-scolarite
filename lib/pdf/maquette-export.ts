import type { MaquetteProgram, MaquetteSemester } from "@/types/maquette";

const DARK_BLUE: [number, number, number] = [0, 54, 95];
const LIGHT_HEADER: [number, number, number] = [240, 246, 252];
const UE_BG: [number, number, number] = [229, 242, 253];
const PROGRAM_BG: [number, number, number] = [0, 100, 140];

export async function exportMaquettePdf(programs: MaquetteProgram[]): Promise<void> {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.width;
  const pageH = doc.internal.pageSize.height;

  // Page title banner
  doc.setFillColor(...DARK_BLUE);
  doc.rect(0, 0, pageW, 18, "F");
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("MAQUETTE PÉDAGOGIQUE", 14, 11);
  if (programs.length === 1) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(programs[0].program_name, pageW - 14, 11, { align: "right" });
  }

  let currentY = 24;
  let firstPage = true;

  for (const prog of programs) {
    if (!firstPage) {
      if (currentY > pageH - 40) {
        doc.addPage();
        currentY = 14;
      } else {
        currentY += 4;
      }
    }
    firstPage = false;

    // Program banner (only when showing multiple programs)
    if (programs.length > 1) {
      if (currentY > pageH - 30) {
        doc.addPage();
        currentY = 14;
      }
      doc.setFillColor(...PROGRAM_BG);
      doc.rect(14, currentY, pageW - 28, 8, "F");
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text(prog.program_name.toUpperCase(), 16, currentY + 5.5);
      doc.setTextColor(0, 0, 0);
      currentY += 10;
    }

    currentY = await renderSemesters(
      doc,
      autoTable,
      prog.semesters,
      currentY,
      pageW,
      pageH
    );
  }

  // Page numbers
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${i} / ${pageCount}`, pageW - 14, pageH - 5, { align: "right" });
  }

  const single = programs.length === 1 ? programs[0].program_name : null;
  const slug = single ? `-${single.toLowerCase().replace(/\s+/g, "-")}` : "";
  doc.save(`maquette${slug}.pdf`);
}

async function renderSemesters(
  doc: InstanceType<typeof import("jspdf").default>,
  autoTable: (doc: unknown, options: unknown) => void,
  semesters: MaquetteSemester[],
  startY: number,
  pageW: number,
  pageH: number
): Promise<number> {
  let currentY = startY;

  for (const semester of semesters) {
    if (currentY > pageH - 40) {
      doc.addPage();
      currentY = 14;
    }

    const totalCr = semester.course_units.reduce((s, u) => s + (u.credits ?? 0), 0);
    doc.setFillColor(...DARK_BLUE);
    doc.rect(14, currentY, pageW - 28, 6.5, "F");
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text(`SEMESTRE ${semester.semester}`, 16, currentY + 4.4);
    doc.text(`${totalCr} crédits`, pageW - 16, currentY + 4.4, { align: "right" });
    doc.setTextColor(0, 0, 0);
    currentY += 8;

    const body: (string | number)[][] = [];
    const rowIsUE: boolean[] = [];

    for (const unit of semester.course_units) {
      const courses = unit.courses ?? [];
      const count = Math.max(courses.length, 1);
      for (let i = 0; i < count; i++) {
        const c = courses[i];
        const vht = c
          ? (c.vht ?? c.hours_lecture + c.hours_td + (c.hours_tpe ?? 0))
          : "";
        body.push([
          i === 0 ? unit.code : "",
          i === 0 ? unit.name : "",
          i === 0 ? (unit.type === "OBLIGATOIRE" ? "Oblig." : "Option.") : "",
          i === 0 ? (unit.credits ?? "") : "",
          i === 0 ? (unit.coefficient ?? "—") : "",
          c ? c.code : "",
          c ? c.name : "",
          c ? c.hours_lecture : "",
          c ? c.hours_td : "",
          c ? (c.hours_tpe ?? 0) : "",
          c ? vht : "",
          c ? c.credits : "",
          c ? c.coefficient : "",
        ]);
        rowIsUE.push(i === 0);
      }
    }

    autoTable(doc, {
      startY: currentY,
      head: [
        ["Code UE", "Nom UE", "Type", "Cr. UE", "Coef UE",
          "Code ECUE", "Intitulé ECUE", "CM", "TD", "TPE", "VHT", "Crédits", "Coef"],
      ],
      body,
      styles: { fontSize: 7.5, cellPadding: 1.5, overflow: "ellipsize" },
      headStyles: {
        fillColor: LIGHT_HEADER,
        textColor: [50, 50, 50] as [number, number, number],
        fontStyle: "bold",
        fontSize: 7,
      },
      didParseCell: (data: { section: string; row: { index: number }; cell: { styles: { fillColor: [number, number, number]; fontStyle: string } } }) => {
        if (data.section === "body" && rowIsUE[data.row.index]) {
          data.cell.styles.fillColor = UE_BG;
          data.cell.styles.fontStyle = "bold";
        }
      },
      columnStyles: {
        0: { cellWidth: 18 }, 1: { cellWidth: 38 }, 2: { cellWidth: 12 },
        3: { cellWidth: 11 }, 4: { cellWidth: 14 }, 5: { cellWidth: 20 },
        6: { cellWidth: "auto" }, 7: { cellWidth: 10 }, 8: { cellWidth: 10 },
        9: { cellWidth: 10 }, 10: { cellWidth: 11 }, 11: { cellWidth: 13 },
        12: { cellWidth: 10 },
      },
      margin: { left: 14, right: 14 },
    });

    currentY =
      (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
  }

  return currentY;
}
