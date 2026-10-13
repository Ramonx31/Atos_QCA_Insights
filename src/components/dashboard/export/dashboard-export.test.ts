import { describe, expect, it } from "vitest";
import { buildDashboardExportHtml } from "@/components/dashboard/export/dashboard-export";
import type { DashboardExportSnapshot } from "@/components/dashboard/export/dashboard-export";

const snapshot: DashboardExportSnapshot = {
  filters: { competences: ["2026-09"], directorates: [], costCenters: [], cells: [], managers: [], acts: ["Visível"] },
  kpis: { total: 10, manual: 7, automated: 3, manualPercentage: 70, automatedPercentage: 30 },
  acts: [{ actName: "Visível", manual: 7, automated: 3, total: 10, manualPercentage: 70, automatedPercentage: 30 }],
  insights: [{ kind: "above_average_manual_rate", actName: "Visível", message: "Visível possui taxa manual superior à média do conjunto filtrado.", values: {} }],
  generatedAt: new Date("2026-10-09T12:00:00-03:00"),
};

describe("exportação do dashboard", () => {
  it("inclui somente os atos já filtrados, sem nova consulta", () => {
    const html = buildDashboardExportHtml(snapshot);
    expect(html).toContain("Visível");
    expect(html).not.toContain("Ato ocultado pelo filtro");
    expect(html).toContain("Atos selecionados");
  });
});
