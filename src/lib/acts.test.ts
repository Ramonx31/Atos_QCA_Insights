import { describe, expect, it } from "vitest";
import { calculateActMetrics } from "@/lib/acts";

describe("calculateActMetrics", () => {
  it("recalcula total e percentuais a partir dos valores absolutos", () => {
    expect(calculateActMetrics({ actName: "Teste", manual: 20, automated: 80 })).toMatchObject({ total: 100, manualPercentage: 20, automatedPercentage: 80 });
  });

  it("não produz NaN quando não há atos", () => {
    expect(calculateActMetrics({ actName: "Teste", manual: 0, automated: 0 })).toMatchObject({ total: 0, manualPercentage: 0, automatedPercentage: 0 });
  });
});
