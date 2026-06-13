export enum LevelType {
  LICENCE = "LICENCE",
  MASTER = "MASTER",
  DOCTORAT = "DOCTORAT",
  CLASSE_PREPARATOIRE = "CLASSE_PREPARATOIRE",
}

export interface Level {
  id: string;
  name: string;
  code: string;
  type: LevelType;
  degree_cycle_id: string | null;
  numero: number | null;
  duration_semesters: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LevelFilters {
  degree_cycle_id?: string;
  type?: LevelType;
}

export interface LevelsResponse {
  data: Level[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}
