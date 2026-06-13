export interface MaquetteCourse {
  id: string;
  code: string;
  name: string;
  credits: number;
  coefficient: number;
  hours_lecture: number;
  hours_td: number;
  hours_tp?: number | null;
  hours_tpe?: number | null;
  vht?: number | null;
}

export interface MaquetteUE {
  id: string;
  code: string;
  name: string;
  credits: number;
  coefficient?: number | null;
  type: "OBLIGATOIRE" | "OPTIONNEL";
  courses: MaquetteCourse[];
}

export interface MaquetteSemester {
  semester: number;
  course_units: MaquetteUE[];
}

export interface MaquetteProgram {
  program_id: string;
  program_name: string;
  semesters: MaquetteSemester[];
}

export interface MaquetteFilters {
  program_id?: string;
}

export type MaquetteResponse = MaquetteProgram[];
