import { describe, expect, it, vi } from "vitest";
import { referenceDashboardExtractionFixture } from "@/server/uploads/fixtures/reference-dashboard-extraction.fixture";
import { ScreenshotExtractionService } from "@/server/uploads/services/screenshot-extraction-service";

const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47]);
const file = { originalFilename: "painel.PNG", mimeType: "image/png" as const, bytes: png };
const metadata = { competence: "2026-09", cell: "Operações", manager: "" };

function createService(providerResult: unknown = referenceDashboardExtractionFixture, duplicate = false) {
  const store = { hasUpload: vi.fn(async () => duplicate), saveUpload: vi.fn(async () => undefined) };
  const provider = { extract: vi.fn(async () => providerResult) };
  return { store, provider, service: new ScreenshotExtractionService(store, provider, undefined, () => new Date("2026-10-13T12:00:00Z")) };
}

describe("ScreenshotExtractionService", () => {
  it("gera preview sem persistir e só salva na confirmação", async () => {
    const { service, store } = createService();
    const preview = await service.createPreview(file);
    expect(preview.extraction.acts[0]).toMatchObject({ manual: 6338, automated: 1742 });
    expect(preview.validationIssues).toEqual([]);
    expect(store.saveUpload).not.toHaveBeenCalled();
    const { fileHash } = await service.confirm(file, metadata, [{ act: "Distribuição", manual: 6338, automated: 1742 }]);
    expect(fileHash).toBe(preview.fileHash);
    expect(store.saveUpload).toHaveBeenCalledWith(expect.objectContaining({ id: fileHash, competence: "2026-09", cell: "Operações", manager: null, uploadedAt: "2026-10-13T12:00:00.000Z" }), file);
  });

  it("rejeita screenshot duplicado no preview e na confirmação", async () => {
    const { service } = createService(referenceDashboardExtractionFixture, true);
    await expect(service.createPreview(file)).rejects.toThrow("já foi enviado");
    await expect(service.confirm(file, metadata, [{ act: "A", manual: 1, automated: 1 }])).rejects.toThrow("já foi enviado");
  });

  it("rejeita metadados e valores inválidos na confirmação", async () => {
    const { service, store } = createService();
    await expect(service.confirm(file, { competence: "setembro" }, [{ act: "A", manual: 1, automated: 1 }])).rejects.toThrow("Arquivo de upload inválido");
    await expect(service.confirm(file, metadata, [{ act: "A", manual: -1, automated: 1 }])).rejects.toThrow("Arquivo de upload inválido");
    expect(store.saveUpload).not.toHaveBeenCalled();
  });
});
