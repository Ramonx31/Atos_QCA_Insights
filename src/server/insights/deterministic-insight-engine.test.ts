import { describe, expect, it } from "vitest";
import { calculateInsightMetrics, generateDeterministicInsights } from "@/server/insights/deterministic-insight-engine";
import type { DashboardActAggregate } from "@/components/dashboard/calculations";

const current: DashboardActAggregate[] = [
  { actName: "Prazos Elaborados", manual: 80, automated: 20, total: 100, manualPercentage: 80, automatedPercentage: 20 },
  { actName: "Publicações", manual: 30, automated: 70, total: 100, manualPercentage: 30, automatedPercentage: 70 },
  { actName: "Protocolos", manual: 10, automated: 90, total: 100, manualPercentage: 10, automatedPercentage: 90 },
];

describe("motor determinístico de insights", () => {
  it("calcula taxas, participações, ranking e comparação com a média ponderada", () => {
    const result = calculateInsightMetrics(current);
    const prazos = result.metrics.find((metric) => metric.actName === "Prazos Elaborados");
    expect(result.averageManualRate).toBe(40);
    expect(prazos).toMatchObject({ manualRate: 80, automationRate: 20, manualVolumeParticipation: 80 / 120 * 100, totalVolumeParticipation: 100 / 300 * 100, manualVolumeRank: 1, manualRateVsAverage: 40 });
  });

  it("identifica a maior concentração manual", () => {
    expect(generateDeterministicInsights({ currentActs: current }).find((insight) => insight.kind === "highest_manual_concentration")).toMatchObject({ actName: "Prazos Elaborados" });
  });

  it("identifica a menor taxa de automação", () => {
    expect(generateDeterministicInsights({ currentActs: current }).find((insight) => insight.kind === "lowest_automation_rate")).toMatchObject({ actName: "Prazos Elaborados" });
  });

  it("identifica alto volume com alta taxa manual pelos thresholds configuráveis", () => {
    const insights = generateDeterministicInsights({ currentActs: current, thresholds: { highVolumeMinimum: 100, highManualRateMinimum: 75 } });
    expect(insights).toEqual(expect.arrayContaining([expect.objectContaining({ kind: "high_volume_high_manual_rate", actName: "Prazos Elaborados" })]));
  });

  it("identifica atos acima da média manual sem atribuir causa", () => {
    const insight = generateDeterministicInsights({ currentActs: current }).find((item) => item.kind === "above_average_manual_rate");
    expect(insight?.message).toBe("Prazos Elaborados possui taxa manual superior à média do conjunto filtrado.");
  });

  it("classifica evolução positiva e negativa somente quando há período anterior", () => {
    const previous: DashboardActAggregate[] = [
      { ...current[0], manual: 90, automated: 10, manualPercentage: 90, automatedPercentage: 10 },
      { ...current[1], manual: 20, automated: 80, manualPercentage: 20, automatedPercentage: 80 },
    ];
    const insights = generateDeterministicInsights({ currentActs: current, previousActs: previous });
    expect(insights).toEqual(expect.arrayContaining([expect.objectContaining({ kind: "positive_evolution", actName: "Prazos Elaborados" }), expect.objectContaining({ kind: "negative_evolution", actName: "Publicações" })]));
  });
});
