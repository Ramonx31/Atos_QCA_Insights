import { z } from "zod";

export const actDisplayNameSchema = z.string().min(1).max(200).refine((value) => value.trim().length > 0, "Nome não pode ser vazio");

export const createActSchema = z.object({
  canonicalName: actDisplayNameSchema,
  isActive: z.boolean().default(true),
  isVisibleByDefault: z.boolean().default(true),
});

export const createActAliasSchema = z.object({
  actId: z.string().uuid(),
  alias: actDisplayNameSchema,
});

export const searchActsSchema = z.object({
  query: z.string().default(""),
  includeInactive: z.boolean().default(false),
  visibleByDefaultOnly: z.boolean().default(false),
  order: z.enum(["canonicalNameAsc", "canonicalNameDesc"]).default("canonicalNameAsc"),
});

export type CreateActInput = z.infer<typeof createActSchema>;
export type CreateActAliasInput = z.infer<typeof createActAliasSchema>;
export type SearchActsInput = z.infer<typeof searchActsSchema>;
