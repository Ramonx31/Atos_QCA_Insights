import type { CreateActInput, SearchActsInput } from "@/server/acts/schemas";

export interface CatalogAct {
  id: string;
  canonicalName: string;
  normalizedName: string;
  isActive: boolean;
  isVisibleByDefault: boolean;
}

export interface ActCatalogRepository {
  createAct(input: CreateActInput & { normalizedName: string }): Promise<CatalogAct>;
  createAlias(input: { actId: string; alias: string; normalizedAlias: string }): Promise<{ id: string }>;
  findTerm(normalizedTerm: string): Promise<{ type: "act" | "alias"; actId: string } | null>;
  search(input: SearchActsInput & { normalizedQuery: string }): Promise<CatalogAct[]>;
}
