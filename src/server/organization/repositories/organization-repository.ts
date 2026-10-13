import type { CreateCellInput, CreateCostCenterInput, CreateDirectorateInput, CreateManagerInput } from "@/server/organization/schemas";

export interface OrganizationRepository {
  createDirectorate(input: CreateDirectorateInput): Promise<{ id: string }>;
  createManager(input: CreateManagerInput): Promise<{ id: string }>;
  createCell(input: CreateCellInput): Promise<{ id: string }>;
  createCostCenter(input: CreateCostCenterInput): Promise<{ id: string }>;
  assignManagerToCell(input: { managerId: string; cellId: string }): Promise<void>;
  assignManagerToCostCenter(input: { managerId: string; costCenterId: string }): Promise<void>;
  assignCellToCostCenter(input: { cellId: string; costCenterId: string }): Promise<void>;
  assignDirectorateToCell(input: { directorateId: string; cellId: string }): Promise<void>;
}
