import { describe, expect, it } from "vitest";
import { aggregateActs, calculateDashboardKpis, filterDashboardFacts } from "@/components/dashboard/calculations";
import type { DashboardFact, DashboardFilters } from "@/server/dashboard/types";

const facts: DashboardFact[] = [
  { id: "1", competence: "2026-09", actName: "Distribuição", manual: 20, automated: 80, costCenter: "CC A", cells: ["Cível"], directorates: ["Jurídico"], managers: ["Ana"] },
  { id: "2", competence: "2026-09", actName: "Protocolo", manual: 30, automated: 10, costCenter: "CC B", cells: ["Fiscal"], directorates: ["Jurídico"], managers: ["Bruno"] },
];
const emptyFilters: DashboardFilters = { competences: [], directorates: [], costCenters: [], cells: [], managers: [], acts: [] };

describe("cálculos do dashboard", () => {
  it("aplica o mesmo filtro aos fatos que alimentam todos os painéis", () => {
    expect(filterDashboardFacts(facts, { ...emptyFilters, acts: ["Protocolo"] })).toEqual([facts[1]]);
  });
  it("recalcula percentuais a partir dos valores agregados", () => {
    const acts = aggregateActs(facts);
    expect(calculateDashboardKpis(acts)).toMatchObject({ total: 140, manual: 50, automated: 90, manualPercentage: 50 / 140 * 100 });
  });
});
