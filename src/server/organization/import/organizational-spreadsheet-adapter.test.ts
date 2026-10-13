import { describe, expect, it } from "vitest";
import { adaptOrganizationalSpreadsheetRow } from "@/server/organization/import/organizational-spreadsheet-adapter";

describe("adaptOrganizationalSpreadsheetRow", () => {
  it("preserva Nome como candidato e não cria associação de gestor", () => {
    expect(adaptOrganizationalSpreadsheetRow({ ID: 12, Status: "Ativo", Nome: "Marina", "Escritório/Célula": "Contencioso", "Centro de Custo": "CC-10" })).toEqual({ sourceId: "12", sourceStatus: "Ativo", managerNameCandidate: "Marina", cellName: "Contencioso", costCenterName: "CC-10", directorateName: null, requiresBusinessValidation: true });
  });

  it("rejeita linha sem coluna obrigatória", () => {
    expect(() => adaptOrganizationalSpreadsheetRow({ ID: "12", Status: "Ativo", Nome: "Marina", "Escritório/Célula": "Contencioso" })).toThrow();
  });
});
