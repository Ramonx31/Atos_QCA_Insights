import { describe, expect, it } from "vitest";
import { referenceDashboardExtractionFixture } from "@/server/uploads/fixtures/reference-dashboard-extraction.fixture";
import { validateExtractionMath } from "@/server/uploads/math-validation";
import { extractionPayloadSchema } from "@/server/uploads/schemas";

describe("validateExtractionMath", () => {
  it("aceita a fixture de referência sem divergências", () => {
    expect(validateExtractionMath(extractionPayloadSchema.parse(referenceDashboardExtractionFixture))).toEqual([]);
  });

  it("reporta divergências sem invalidar o preview", () => {
    const payload = extractionPayloadSchema.parse({ ...referenceDashboardExtractionFixture, acts: [{ ...referenceDashboardExtractionFixture.acts[0], total: "8.000", manualPercentage: "70,00%" }, referenceDashboardExtractionFixture.acts[1]] });
    expect(validateExtractionMath(payload)).toEqual(expect.arrayContaining([expect.objectContaining({ code: "total_mismatch", act: "Distribuição" }), expect.objectContaining({ code: "manual_percentage_mismatch", act: "Distribuição" }), expect.objectContaining({ code: "acts_sum_mismatch" })]));
  });
});
