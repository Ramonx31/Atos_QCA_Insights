import { describe, expect, it } from "vitest";
import { parseFirstActsTable } from "@/server/uploads/pdf-table-parser";

describe("parseFirstActsTable", () => {
  it("descobre as colunas pelo cabeçalho, sem depender da escala do PDF", () => {
    const extraction = parseFirstActsTable([
      { text: "Ato", x: 10, y: 100 }, { text: "Atos Manuais", x: 120, y: 100 }, { text: "Atos Automatizados", x: 240, y: 100 }, { text: "Total", x: 360, y: 100 },
      { text: "Ato de teste", x: 20, y: 80 }, { text: "12", x: 130, y: 80 }, { text: "8", x: 250, y: 80 }, { text: "20", x: 370, y: 80 },
      { text: "Total", x: 20, y: 60 }, { text: "12", x: 130, y: 60 }, { text: "8", x: 250, y: 60 }, { text: "20", x: 370, y: 60 },
      { text: "Detalhamento dos Atos por Centro de Custo", x: 10, y: 20 },
    ]);
    expect(extraction).toMatchObject({ acts: [{ act: "Ato de teste", manual: "12", automated: "8", total: "20" }], total: { manual: 12, automated: 8, total: 20 } });
  });
});
