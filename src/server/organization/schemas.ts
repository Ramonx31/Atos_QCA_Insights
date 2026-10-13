import { z } from "zod";

const name = z.string().trim().min(1).max(150);
const id = z.string().uuid();

export const createDirectorateSchema = z.object({ name });
export const createManagerSchema = z.object({ name });
export const createCellSchema = z.object({ name });
export const createCostCenterSchema = z.object({ code: z.string().trim().min(1).max(50), name });
export const assignManagerCellSchema = z.object({ managerId: id, cellId: id });
export const assignManagerCostCenterSchema = z.object({ managerId: id, costCenterId: id });
export const assignCellCostCenterSchema = z.object({ cellId: id, costCenterId: id });
export const assignDirectorateCellSchema = z.object({ directorateId: id, cellId: id });

export const organizationalSpreadsheetRowSchema = z.object({
  ID: z.union([z.string(), z.number()]).transform(String).pipe(z.string().trim().min(1)),
  Status: z.string().trim().min(1),
  Nome: z.string().trim().min(1).max(150),
  "Escritório/Célula": z.string().trim().min(1).max(150),
  "Centro de Custo": z.string().trim().min(1).max(150),
});

export type CreateDirectorateInput = z.infer<typeof createDirectorateSchema>;
export type CreateManagerInput = z.infer<typeof createManagerSchema>;
export type CreateCellInput = z.infer<typeof createCellSchema>;
export type CreateCostCenterInput = z.infer<typeof createCostCenterSchema>;
export type OrganizationalSpreadsheetRow = z.infer<typeof organizationalSpreadsheetRowSchema>;
