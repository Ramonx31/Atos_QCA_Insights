import { describe, expect, it, vi } from "vitest";
import type { OrganizationRepository } from "@/server/organization/repositories/organization-repository";
import { OrganizationService } from "@/server/organization/services/organization-service";

const repository: OrganizationRepository = {
  createDirectorate: vi.fn(), createManager: vi.fn(), createCell: vi.fn(), createCostCenter: vi.fn(),
  assignManagerToCell: vi.fn(), assignManagerToCostCenter: vi.fn(), assignCellToCostCenter: vi.fn(), assignDirectorateToCell: vi.fn(),
};

describe("OrganizationService", () => {
  it("valida uma associação N:N antes de delegá-la", async () => {
    const input = { managerId: "782e1e7b-7474-470c-8e84-cafadf2e55cb", cellId: "a2b29e54-2865-4d85-aa42-5684aafc2205" };
    await new OrganizationService(repository).assignManagerToCell(input);
    expect(repository.assignManagerToCell).toHaveBeenCalledWith(input);
  });

  it("rejeita IDs inválidos", () => {
    expect(() => new OrganizationService(repository).assignManagerToCostCenter({ managerId: "invalido", costCenterId: "invalido" })).toThrow();
  });
});
