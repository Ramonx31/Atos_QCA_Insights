import { z } from "zod";

const optionalLabel = z.string().trim().max(150).nullable();
const optionalLabels = z.array(z.string().trim().min(1).max(150)).max(100).optional().default([]);

export const storedActSchema = z.object({
  act: z.string().trim().min(1).max(200),
  manual: z.number().int().nonnegative(),
  automated: z.number().int().nonnegative(),
});

/** Registro de um screenshot confirmado; é imutável e identificado pelo SHA-256 da imagem. */
export const storedUploadSchema = z.object({
  id: z.string().regex(/^[0-9a-f]{64}$/),
  uploadedAt: z.string().datetime(),
  originalFilename: z.string().min(1).max(255),
  screenshotPath: z.string().min(1),
  competence: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/),
  directorate: optionalLabel,
  costCenter: optionalLabel,
  cell: optionalLabel,
  cells: optionalLabels,
  manager: optionalLabel,
  acts: z.array(storedActSchema).min(1),
});

export type StoredAct = z.infer<typeof storedActSchema>;
export type StoredUpload = z.infer<typeof storedUploadSchema>;
