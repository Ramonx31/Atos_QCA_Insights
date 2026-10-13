import { assignCellCostCenterSchema, assignDirectorateCellSchema, assignManagerCellSchema, assignManagerCostCenterSchema, createCellSchema, createCostCenterSchema, createDirectorateSchema, createManagerSchema } from "@/server/organization/schemas";
import type { OrganizationRepository } from "@/server/organization/repositories/organization-repository";

export class OrganizationService {
  constructor(private readonly repository: OrganizationRepository) {}
  createDirectorate(input: unknown) { return this.repository.createDirectorate(createDirectorateSchema.parse(input)); }
  createManager(input: unknown) { return this.repository.createManager(createManagerSchema.parse(input)); }
  createCell(input: unknown) { return this.repository.createCell(createCellSchema.parse(input)); }
  createCostCenter(input: unknown) { return this.repository.createCostCenter(createCostCenterSchema.parse(input)); }
  assignManagerToCell(input: unknown) { return this.repository.assignManagerToCell(assignManagerCellSchema.parse(input)); }
  assignManagerToCostCenter(input: unknown) { return this.repository.assignManagerToCostCenter(assignManagerCostCenterSchema.parse(input)); }
  assignCellToCostCenter(input: unknown) { return this.repository.assignCellToCostCenter(assignCellCostCenterSchema.parse(input)); }
  assignDirectorateToCell(input: unknown) { return this.repository.assignDirectorateToCell(assignDirectorateCellSchema.parse(input)); }
}
