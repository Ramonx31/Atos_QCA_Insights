export interface DashboardFact {
  id: string;
  competence: string;
  actName: string;
  manual: number;
  automated: number;
  costCenter: string | null;
  cells: string[];
  directorates: string[];
  managers: string[];
}

export interface DashboardFilters {
  competences: string[];
  directorates: string[];
  costCenters: string[];
  cells: string[];
  managers: string[];
  acts: string[];
}

export type DisplayMode = "values" | "percentages" | "both";
