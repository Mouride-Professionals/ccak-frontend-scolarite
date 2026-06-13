export enum DegreeCycleType {
  LICENCE = "LICENCE",
  MASTER = "MASTER",
  DOCTORAT = "DOCTORAT",
  CLASSE_PREPARATOIRE = "CLASSE_PREPARATOIRE",
}

export interface DegreeCycle {
  id: string;
  name: string;
  code: string;
  type: DegreeCycleType;
  levels: import("./level").Level[];
  created_at?: string;
  updated_at?: string;
}
