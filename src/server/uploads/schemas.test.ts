import { describe, expect, it } from "vitest";
import { referenceDashboardExtractionFixture } from "@/server/uploads/fixtures/reference-dashboard-extraction.fixture";
import { extractionPayloadSchema, parseBrazilianNumber, screenshotFileSchema } from "@/server/uploads/schemas";

describe("schemas de screenshot", () => {
  it("converte milhares e percentuais pt-BR da fixture de referência", () => {
    const parsed = extractionPayloadSchema.parse(referenceDashboardExtractionFixture);
    expect(parsed.acts[0]).toMatchObject({ manual: 6338, automated: 1742, total: 8080, manualPercentage: 78.44, automatedPercentage: 21.56 });
    expect(parseBrazilianNumber("78,45%")).toBe(78.45);
  });

  it("aceita somente formatos de screenshot declarados", () => {
    expect(() => screenshotFileSchema.parse({ originalFilename: "painel.pdf", mimeType: "application/pdf", bytes: new Uint8Array([1]) })).toThrow();
    expect(() => screenshotFileSchema.parse({ originalFilename: "painel.jpg", mimeType: "image/png", bytes: new Uint8Array([1]) })).toThrow();
  });
});
