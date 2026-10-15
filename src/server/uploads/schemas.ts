import { z } from "zod";

export const SUPPORTED_SCREENSHOT_MIME_TYPES = ["application/pdf"] as const;
/** Funções serverless da Vercel aceitam corpos de até ~4,5 MB; o upload é reenviado na confirmação. */
export const MAX_SCREENSHOT_BYTES = 10 * 1024 * 1024;

const extensionForMimeType: Record<(typeof SUPPORTED_SCREENSHOT_MIME_TYPES)[number], RegExp> = {
  "application/pdf": /\.pdf$/i,
};

export const screenshotFileSchema = z.object({
  originalFilename: z.string().min(1).max(255).refine((name) => !/[\\/\0]/.test(name), "Nome de arquivo inválido"),
  mimeType: z.enum(SUPPORTED_SCREENSHOT_MIME_TYPES),
  bytes: z.instanceof(Uint8Array).refine((bytes) => bytes.byteLength > 0 && bytes.byteLength <= MAX_SCREENSHOT_BYTES, "Tamanho de arquivo inválido"),
}).superRefine((file, context) => {
  if (!extensionForMimeType[file.mimeType].test(file.originalFilename)) context.addIssue({ code: z.ZodIssueCode.custom, path: ["originalFilename"], message: "Extensão incompatível com o tipo do arquivo" });
  const signature = file.bytes;
  const valid = signature[0] === 0x25 && signature[1] === 0x50 && signature[2] === 0x44 && signature[3] === 0x46;
  if (!valid) context.addIssue({ code: z.ZodIssueCode.custom, path: ["bytes"], message: "Conteúdo incompatível com o tipo MIME" });
});

/** Converte formatos numéricos habituais do dashboard pt-BR sem arredondar o valor extraído. */
export function parseBrazilianNumber(value: string | number): number {
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error("Número inválido");
    return value;
  }
  const normalized = value.trim().replace(/%/g, "").replace(/\./g, "").replace(",", ".");
  if (!normalized || !/^-?\d+(\.\d+)?$/.test(normalized)) throw new Error(`Número pt-BR inválido: ${value}`);
  return Number(normalized);
}

const extractedNumber = z.union([z.string(), z.number()]).transform((value, context) => {
  try { return parseBrazilianNumber(value); }
  catch (error) { context.addIssue({ code: z.ZodIssueCode.custom, message: error instanceof Error ? error.message : "Número inválido" }); return z.NEVER; }
});

const optionalExtractedNumber = z.union([z.string(), z.number()]).optional().transform((value, context) => {
  if (value === undefined) return undefined;
  try { return parseBrazilianNumber(value); }
  catch (error) { context.addIssue({ code: z.ZodIssueCode.custom, message: error instanceof Error ? error.message : "Número inválido" }); return z.NEVER; }
});

export const extractedActSchema = z.object({
  act: z.string().trim().min(1).max(200),
  manual: extractedNumber,
  automated: extractedNumber,
  total: extractedNumber,
  manualPercentage: optionalExtractedNumber,
  automatedPercentage: optionalExtractedNumber,
  totalPercentage: optionalExtractedNumber,
});

export const extractionPayloadSchema = z.object({
  acts: z.array(extractedActSchema).min(1),
  total: extractedActSchema,
});

const MAX_ACTS_PER_UPLOAD = 200;
const optionalLabel = z.string().trim().max(150).optional().transform((value) => value || null);
const optionalLabels = z.array(z.string().trim().min(1).max(150)).max(100).optional().default([]);

/** Contexto organizacional informado por quem envia; a competência é obrigatória e as demais etiquetas são opcionais. */
export const uploadMetadataSchema = z.object({
  competence: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Competência inválida (use AAAA-MM)"),
  directorate: optionalLabel,
  costCenter: optionalLabel,
  cell: optionalLabel,
  cells: optionalLabels,
  manager: optionalLabel,
});

/** Valores revisados por uma pessoa; o total e os percentuais são sempre recalculados. */
export const confirmedActsSchema = z.array(z.object({
  act: z.string().trim().min(1).max(200),
  manual: z.number().int().nonnegative(),
  automated: z.number().int().nonnegative(),
})).min(1).max(MAX_ACTS_PER_UPLOAD);

export type UploadMetadata = z.infer<typeof uploadMetadataSchema>;
export type ConfirmedAct = z.infer<typeof confirmedActsSchema>[number];
export type ScreenshotFile = z.infer<typeof screenshotFileSchema>;
export type ExtractedAct = z.infer<typeof extractedActSchema>;
export type ExtractionPayload = z.infer<typeof extractionPayloadSchema>;
