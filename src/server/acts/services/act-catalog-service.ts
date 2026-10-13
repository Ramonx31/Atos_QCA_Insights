import { normalizeActName } from "@/server/acts/act-name-normalizer";
import { createActAliasSchema, createActSchema, searchActsSchema } from "@/server/acts/schemas";
import type { ActCatalogRepository, CatalogAct } from "@/server/acts/repositories/act-catalog-repository";

export class DuplicateActTermError extends Error {
  constructor() { super("Já existe um ato ou alias com o mesmo nome lógico."); }
}

export type UploadActResolution =
  | { status: "mapped"; actId: string }
  | { status: "pending_mapping"; sourceName: string; normalizedName: string };

export class ActCatalogService {
  constructor(private readonly repository: ActCatalogRepository) {}

  async createAct(input: unknown): Promise<CatalogAct> {
    const parsed = createActSchema.parse(input);
    const normalizedName = normalizeActName(parsed.canonicalName);
    if (await this.repository.findTerm(normalizedName)) throw new DuplicateActTermError();
    return this.repository.createAct({ ...parsed, normalizedName });
  }

  async createAlias(input: unknown): Promise<{ id: string }> {
    const parsed = createActAliasSchema.parse(input);
    const normalizedAlias = normalizeActName(parsed.alias);
    if (await this.repository.findTerm(normalizedAlias)) throw new DuplicateActTermError();
    return this.repository.createAlias({ ...parsed, normalizedAlias });
  }

  async resolveUploadAct(sourceName: string): Promise<UploadActResolution> {
    const normalizedName = normalizeActName(sourceName);
    const match = await this.repository.findTerm(normalizedName);
    return match ? { status: "mapped", actId: match.actId } : { status: "pending_mapping", sourceName, normalizedName };
  }

  search(input: unknown) {
    const parsed = searchActsSchema.parse(input);
    return this.repository.search({ ...parsed, normalizedQuery: normalizeActName(parsed.query) });
  }
}
