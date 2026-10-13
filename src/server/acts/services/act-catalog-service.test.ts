import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ActCatalogRepository } from "@/server/acts/repositories/act-catalog-repository";
import { ActCatalogService, DuplicateActTermError } from "@/server/acts/services/act-catalog-service";

const repository: ActCatalogRepository = {
  createAct: vi.fn(async (input) => ({ id: "1", ...input })),
  createAlias: vi.fn(async () => ({ id: "2" })),
  findTerm: vi.fn(),
  search: vi.fn(async () => []),
};

describe("ActCatalogService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("preserva o nome canônico e salva uma chave normalizada", async () => {
    vi.mocked(repository.findTerm).mockResolvedValueOnce(null);
    await new ActCatalogService(repository).createAct({ canonicalName: "Citação — Réu" });
    expect(repository.createAct).toHaveBeenCalledWith(expect.objectContaining({ canonicalName: "Citação — Réu", normalizedName: "citacao-reu" }));
  });

  it("impede duplicidade lógica entre ato e alias", async () => {
    vi.mocked(repository.findTerm).mockResolvedValueOnce({ type: "alias", actId: "1" });
    await expect(new ActCatalogService(repository).createAct({ canonicalName: "Citacao-Reu" })).rejects.toBeInstanceOf(DuplicateActTermError);
  });

  it("retorna pending_mapping sem criar ato desconhecido", async () => {
    vi.mocked(repository.findTerm).mockResolvedValueOnce(null);
    await expect(new ActCatalogService(repository).resolveUploadAct("Ato novo")).resolves.toEqual({ status: "pending_mapping", sourceName: "Ato novo", normalizedName: "ato novo" });
    expect(repository.createAct).not.toHaveBeenCalled();
  });

  it("normaliza o termo de busca e preserva a ordenação solicitada", async () => {
    await new ActCatalogService(repository).search({ query: "  CITAÇÃO — RÉU ", order: "canonicalNameDesc" });
    expect(repository.search).toHaveBeenCalledWith(expect.objectContaining({ normalizedQuery: "citacao-reu", order: "canonicalNameDesc" }));
  });
});
