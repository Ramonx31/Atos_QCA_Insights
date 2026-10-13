import type { DashboardActAggregate } from "@/components/dashboard/calculations";

export interface InsightThresholds {
  /** Volume total mínimo para considerar um ato de alto volume. */
  highVolumeMinimum: number;
  /** Taxa manual mínima para classificar um ato como de alta taxa manual. */
  highManualRateMinimum: number;
  /** Diferença mínima, em pontos percentuais, acima da média manual filtrada. */
  aboveAverageManualRateDelta: number;
  /** Variação mínima, em pontos percentuais, para sinalizar evolução entre períodos. */
  evolutionPercentagePointDelta: number;
}

export const defaultInsightThresholds: InsightThresholds = {
  highVolumeMinimum: 100,
  highManualRateMinimum: 50,
  aboveAverageManualRateDelta: 0.01,
  evolutionPercentagePointDelta: 0.1,
};

export interface ActInsightMetric extends DashboardActAggregate {
  manualRate: number;
  automationRate: number;
  manualVolumeParticipation: number;
  totalVolumeParticipation: number;
  manualVolumeRank: number;
  manualRateVsAverage: number;
}

export type InsightKind = "highest_manual_concentration" | "lowest_automation_rate" | "high_volume_high_manual_rate" | "above_average_manual_rate" | "positive_evolution" | "negative_evolution";

export interface DeterministicInsight {
  kind: InsightKind;
  actName: string;
  message: string;
  values: Record<string, number>;
}

const percentage = (value: number, total: number) => total === 0 ? 0 : value / total * 100;
const formatRate = (value: number) => `${value.toFixed(1)}%`;

/** Métricas derivadas somente dos valores do conjunto filtrado. */
export function calculateInsightMetrics(acts: DashboardActAggregate[]): { metrics: ActInsightMetric[]; averageManualRate: number } {
  const totalManual = acts.reduce((sum, act) => sum + act.manual, 0);
  const totalVolume = acts.reduce((sum, act) => sum + act.total, 0);
  const averageManualRate = percentage(totalManual, totalVolume);
  const byManualVolume = [...acts].sort((left, right) => right.manual - left.manual || left.actName.localeCompare(right.actName, "pt-BR"));
  const ranks = new Map(byManualVolume.map((act, index) => [act.actName, index + 1]));
  return {
    averageManualRate,
    metrics: acts.map((act) => ({
      ...act,
      manualRate: act.manualPercentage,
      automationRate: act.automatedPercentage,
      manualVolumeParticipation: percentage(act.manual, totalManual),
      totalVolumeParticipation: percentage(act.total, totalVolume),
      manualVolumeRank: ranks.get(act.actName) ?? 0,
      manualRateVsAverage: act.manualPercentage - averageManualRate,
    })),
  };
}

export function generateDeterministicInsights(input: { currentActs: DashboardActAggregate[]; previousActs?: DashboardActAggregate[]; thresholds?: Partial<InsightThresholds> }): DeterministicInsight[] {
  const thresholds = { ...defaultInsightThresholds, ...input.thresholds };
  const { metrics, averageManualRate } = calculateInsightMetrics(input.currentActs);
  if (metrics.length === 0) return [];
  const insights: DeterministicInsight[] = [];
  const highestManual = [...metrics].sort((left, right) => right.manualVolumeParticipation - left.manualVolumeParticipation || left.actName.localeCompare(right.actName, "pt-BR"))[0];
  insights.push({ kind: "highest_manual_concentration", actName: highestManual.actName, message: `${highestManual.actName} concentra a maior participação do volume manual (${formatRate(highestManual.manualVolumeParticipation)}).`, values: { manualVolumeParticipation: highestManual.manualVolumeParticipation, manualVolumeRank: highestManual.manualVolumeRank } });
  const lowestAutomation = [...metrics].sort((left, right) => left.automationRate - right.automationRate || left.actName.localeCompare(right.actName, "pt-BR"))[0];
  insights.push({ kind: "lowest_automation_rate", actName: lowestAutomation.actName, message: `${lowestAutomation.actName} possui a menor taxa de automação (${formatRate(lowestAutomation.automationRate)}).`, values: { automationRate: lowestAutomation.automationRate } });
  for (const metric of metrics) {
    if (metric.total >= thresholds.highVolumeMinimum && metric.manualRate >= thresholds.highManualRateMinimum) insights.push({ kind: "high_volume_high_manual_rate", actName: metric.actName, message: `${metric.actName} possui alto volume (${metric.total.toLocaleString("pt-BR")}) e alta taxa manual (${formatRate(metric.manualRate)}).`, values: { total: metric.total, manualRate: metric.manualRate } });
    if (metric.manualRate - averageManualRate >= thresholds.aboveAverageManualRateDelta) insights.push({ kind: "above_average_manual_rate", actName: metric.actName, message: `${metric.actName} possui taxa manual superior à média do conjunto filtrado.`, values: { manualRate: metric.manualRate, averageManualRate, delta: metric.manualRate - averageManualRate } });
  }
  if (!input.previousActs) return insights;
  const previous = new Map(input.previousActs.map((act) => [act.actName, act]));
  for (const metric of metrics) {
    const prior = previous.get(metric.actName);
    if (!prior) continue;
    const difference = metric.manualRate - prior.manualPercentage;
    if (difference <= -thresholds.evolutionPercentagePointDelta) insights.push({ kind: "positive_evolution", actName: metric.actName, message: `A taxa manual de ${metric.actName} caiu de ${formatRate(prior.manualPercentage)} para ${formatRate(metric.manualRate)} em relação ao período anterior.`, values: { previousManualRate: prior.manualPercentage, currentManualRate: metric.manualRate, difference } });
    if (difference >= thresholds.evolutionPercentagePointDelta) insights.push({ kind: "negative_evolution", actName: metric.actName, message: `A taxa manual de ${metric.actName} subiu de ${formatRate(prior.manualPercentage)} para ${formatRate(metric.manualRate)} em relação ao período anterior.`, values: { previousManualRate: prior.manualPercentage, currentManualRate: metric.manualRate, difference } });
  }
  return insights;
}
