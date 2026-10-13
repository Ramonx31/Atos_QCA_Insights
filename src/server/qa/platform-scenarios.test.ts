import { describe, expect, it, vi } from "vitest";
import { aggregateActs, filterDashboardFacts } from "@/components/dashboard/calculations";
import { buildDashboardExportHtml } from "@/components/dashboard/export/dashboard-export";
import { ActCatalogService } from "@/server/acts/services/act-catalog-service";
import { validateExtractionMath } from "@/server/uploads/math-validation";
import { extractionPayloadSchema } from "@/server/uploads/schemas";
import { ScreenshotExtractionService } from "@/server/uploads/services/screenshot-extraction-service";
import type { DashboardFact, DashboardFilters } from "@/server/dashboard/types";
import { referenceDashboardExtractionFixture } from "@/server/uploads/fixtures/reference-dashboard-extraction.fixture";

const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47]);
const emptyFilters: DashboardFilters = { competences: [], directorates: [], costCenters: [], cells: [], managers: [], acts: [] };
const facts: DashboardFact[] = [
  { id: "1", competence: "2026-09", actName: "Visível", manual: 8, automated: 2, costCenter: "CC", cells: ["Célula"], directorates: ["Jurídico"], managers: ["Ana", "Bruno"] },
  { id: "2", competence: "2026-09", actName: "Ocultado", manual: 5, automated: 5, costCenter: "CC", cells: ["Célula"], directorates: ["Jurídico"], managers: ["Ana"] },
  { id: "3", competence: "2026-09", actName: "Visível", manual: 2, automated: 8, costCenter: "CC", cells: ["Célula"], directorates: ["Jurídico"], managers: ["Bruno"] },
];

function uploadService(providerResult: unknown = referenceDashboardExtractionFixture, duplicate = false) {
  return new ScreenshotExtractionService(
    { hasUpload: vi.fn(async () => duplicate), saveUpload: vi.fn(async () => undefined) },
    { extract: vi.fn(async () => providerResult) },
  );
}

describe("QA funcional e técnico", () => {
  it("positivo: aceita upload válido, extrai e confirma", async () => {
    const service = uploadService();
    const preview = await service.createPreview({ originalFilename: "painel.png", mimeType: "image/png", bytes: png });
    expect(preview.extraction.acts[0]).toMatchObject({ manual: 6338, automated: 1742 });
    await service.confirm({ originalFilename: "painel.png", mimeType: "image/png", bytes: png }, { competence: "2026-09" }, [{ act: "Distribuição", manual: 6338, automated: 1742 }]);
  });

  it("negativo: rejeita arquivo inválido, imagem sem tabela e número ilegível", async () => {
    await expect(uploadService().createPreview({ originalFilename: "painel.pdf", mimeType: "image/png", bytes: png })).rejects.toThrow("Arquivo de upload inválido");
    await expect(uploadService({ acts: [], total: {} }).createPreview({ originalFilename: "painel.png", mimeType: "image/png", bytes: png })).rejects.toThrow("Não foi possível processar");
    await expect(uploadService({ acts: [{ ...referenceDashboardExtractionFixture.acts[0], manual: "ilegível" }], total: referenceDashboardExtractionFixture.total }).createPreview({ originalFilename: "painel.png", mimeType: "image/png", bytes: png })).rejects.toThrow("Não foi possível processar");
  });

  it("negativo: total divergente vira issue sem bloquear o preview", async () => {
    const source = { acts: [{ ...referenceDashboardExtractionFixture.acts[0], act: "Desconhecido", total: "1" }], total: referenceDashboardExtractionFixture.total };
    const preview = await uploadService(source).createPreview({ originalFilename: "painel.png", mimeType: "image/png", bytes: png });
    expect(preview.validationIssues).toEqual(expect.arrayContaining([expect.objectContaining({ code: "total_mismatch" })]));
  });

  it("exceções: aceita zero e percentuais ausentes sem gerar erro de processamento", () => {
    const payload = extractionPayloadSchema.parse({ acts: [{ act: "Zero", manual: "0", automated: "0", total: "0" }], total: { act: "Total", manual: "0", automated: "0", total: "0" } });
    expect(validateExtractionMath(payload)).toEqual([]);
  });

  it("exceção: bloqueia screenshot duplicado", async () => {
    await expect(uploadService(referenceDashboardExtractionFixture, true).createPreview({ originalFilename: "painel.png", mimeType: "image/png", bytes: png })).rejects.toThrow("já foi enviado");
  });

  it("exceção: bloqueia ato repetido por nome lógico", async () => {
    const repository = { createAct: vi.fn(), createAlias: vi.fn(), findTerm: vi.fn(async () => ({ type: "act" as const, actId: "act-1" })), search: vi.fn() };
    await expect(new ActCatalogService(repository).createAct({ canonicalName: "Ato Repetido" })).rejects.toThrow("Já existe um ato");
  });

  it("dashboard: competência duplicada agrega fatos e múltiplos gestores permanecem filtráveis", () => {
    const selected = filterDashboardFacts(facts, { ...emptyFilters, competences: ["2026-09"], managers: ["Bruno"] });
    expect(selected).toHaveLength(2);
    expect(aggregateActs(facts).find((act) => act.actName === "Visível")?.total).toBe(20);
  });

  it("regressão: filtros não alteram fatos armazenados e exportação não inclui ato ocultado", () => {
    const original = structuredClone(facts);
    const selected = filterDashboardFacts(facts, { ...emptyFilters, acts: ["Visível"] });
    const acts = aggregateActs(selected);
    const html = buildDashboardExportHtml({ filters: { ...emptyFilters, acts: ["Visível"] }, kpis: { total: 20, manual: 10, automated: 10, manualPercentage: 50, automatedPercentage: 50 }, acts, insights: [], generatedAt: new Date("2026-10-09T12:00:00Z") });
    expect(facts).toEqual(original);
    expect(html).toContain("Visível");
    expect(html).not.toContain("Ocultado");
  });

  it("regressão: inclusão de alias não altera o registro histórico", async () => {
    const history = { actName: "Prazo", manual: 3, automated: 7 };
    const repository = { createAct: vi.fn(), createAlias: vi.fn(async () => ({ id: "alias-1" })), findTerm: vi.fn(async () => null), search: vi.fn() };
    await new ActCatalogService(repository).createAlias({ actId: "782e1e7b-7474-470c-8e84-cafadf2e55cb", alias: "Prazo processual" });
    expect(history).toEqual({ actName: "Prazo", manual: 3, automated: 7 });
  });
});
