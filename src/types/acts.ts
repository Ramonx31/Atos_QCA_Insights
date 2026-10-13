export type Competence = `${number}-${string}`;

export interface ActMetric {
  actName: string;
  manual: number;
  automated: number;
  /** Percentual lido na fonte, preservado somente para futura comparação. */
  extractedManualPercentage?: number;
  extractedAutomatedPercentage?: number;
}

export interface ActRecord extends ActMetric {
  id: string;
  competence: Competence;
  costCenter: string;
  cell: string;
  manager: string;
  directorate: string;
}

export interface CalculatedActRecord extends ActRecord {
  total: number;
  manualPercentage: number;
  automatedPercentage: number;
}
