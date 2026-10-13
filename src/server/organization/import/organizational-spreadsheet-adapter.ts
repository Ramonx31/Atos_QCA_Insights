import { organizationalSpreadsheetRowSchema, type OrganizationalSpreadsheetRow } from "@/server/organization/schemas";

export const ORGANIZATIONAL_SPREADSHEET_COLUMNS = ["ID", "Status", "Nome", "Escritório/Célula", "Centro de Custo"] as const;

export interface OrganizationalImportCandidate {
  sourceId: string;
  sourceStatus: string;
  cellName: string;
  costCenterName: string;
  /** O valor de Nome não cria associação automática de gestor. */
  managerNameCandidate: string;
  directorateName: null;
  requiresBusinessValidation: true;
}

/** Adapta uma linha já lida de XLSX; a leitura física do arquivo será infraestrutura futura. */
export function adaptOrganizationalSpreadsheetRow(input: unknown): OrganizationalImportCandidate {
  const row: OrganizationalSpreadsheetRow = organizationalSpreadsheetRowSchema.parse(input);
  return {
    sourceId: row.ID,
    sourceStatus: row.Status,
    cellName: row["Escritório/Célula"],
    costCenterName: row["Centro de Custo"],
    managerNameCandidate: row.Nome,
    directorateName: null,
    requiresBusinessValidation: true,
  };
}
