import { describe, expect, it } from "vitest";
import { buildDashboardFacts } from "@/server/results/build-facts";
import type { StoredUpload } from "@/server/results/stored-upload";

const upload = (overrides: Partial<StoredUpload>): StoredUpload => ({
  id: "a".repeat(64), uploadedAt: "2026-10-01T10:00:00.000Z", originalFilename: "p.png", screenshotPath: "screenshots/a.png",
  competence: "2026-09", directorate: null, costCenter: null, cell: null, manager: null, acts: [{ act: "Distribuição", manual: 3, automated: 7 }], ...overrides,
});

describe("buildDashboardFacts", () => {
  it("gera um fato por ato e propaga etiquetas organizacionais", () => {
    const [fact] = buildDashboardFacts([upload({ cell: "Operações", manager: "Ana", costCenter: "CC1" })]);
    expect(fact).toMatchObject({ actName: "Distribuição", manual: 3, automated: 7, cells: ["Operações"], managers: ["Ana"], directorates: [], costCenter: "CC1" });
  });

  it("unifica nomes equivalentes usando o primeiro upload", () => {
    const facts = buildDashboardFacts([
      upload({ id: "b".repeat(64), uploadedAt: "2026-10-02T10:00:00.000Z", acts: [{ act: "DISTRIBUICAO", manual: 1, automated: 1 }] }),
      upload({}),
    ]);
    expect(new Set(facts.map((fact) => fact.actName))).toEqual(new Set(["Distribuição"]));
  });
});
