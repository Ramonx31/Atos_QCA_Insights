import { describe, expect, it } from "vitest";
import { normalizeActName } from "@/server/acts/act-name-normalizer";

describe("normalizeActName", () => {
  it("normaliza caixa, espaços, hífens e travessões para comparação", () => {
    expect(normalizeActName("  CITAÇÃO —  RÉU  ")).toBe("citacao-reu");
    expect(normalizeActName("citação-réu")).toBe("citacao-reu");
  });

  it("não altera o valor de origem", () => {
    const name = "Citação — Réu";
    normalizeActName(name);
    expect(name).toBe("Citação — Réu");
  });
});
