import { describe, expect, it } from "vitest";
import { buildDashboardFacts } from "@/server/results/build-facts";
import type { StoredUpload } from "@/server/results/stored-upload";

const upload = (overrides: Partial<StoredUpload>): StoredUpload => ({
  id: "a".repeat(64), uploadedAt: "2026-10-01T10:00:00.000Z", originalFilename: "p.pdf", screenshotPath: "screenshots/a.pdf",
  competence: "2026-09", directorate: null, costCenter: null, cell: null, cells: [], manager: null, acts: [{ act: "Distribuição", manual: 3, automated: 7 }], ...overrides,
});

describe("buildDashboardFacts", () => {
  it("gera um fato por ato e propaga etiquetas organizacionais", () => {
    const [fact] = buildDashboardFacts([upload({ cell: "Operações", manager: "Ana", costCenter: "CC1" })]);
    expect(fact).toMatchObject({ actName: "Distribuição", manual: 3, automated: 7, cells: ["Operações"], managers: ["Ana"], directorates: [], costCenter: "CC1" });
  });

  it("propaga todas as células selecionadas no mesmo envio", () => {
    const [fact] = buildDashboardFacts([upload({ cells: ["Célula A", "Célula B"], costCenter: "CC1" })]);
    expect(fact.cells).toEqual(["Célula A", "Célula B"]);
  });

  it("usa o nome da versão vigente para atos equivalentes", () => {
    const facts = buildDashboardFacts([
      upload({ id: "b".repeat(64), uploadedAt: "2026-10-02T10:00:00.000Z", acts: [{ act: "DISTRIBUICAO", manual: 1, automated: 1 }] }),
      upload({}),
    ]);
    expect(new Set(facts.map((fact) => fact.actName))).toEqual(new Set(["DISTRIBUICAO"]));
  });

  it("mantém somente o PDF mais recente para a mesma competência e contexto", () => {
    const facts = buildDashboardFacts([
      upload({ id: "a".repeat(64), uploadedAt: "2026-09-01T10:00:00.000Z", acts: [{ act: "Ato", manual: 10, automated: 1 }] }),
      upload({ id: "b".repeat(64), uploadedAt: "2026-09-02T10:00:00.000Z", acts: [{ act: "Ato", manual: 4, automated: 6 }] }),
    ]);
    expect(facts).toHaveLength(1);
    expect(facts[0]).toMatchObject({ manual: 4, automated: 6 });
  });
});
