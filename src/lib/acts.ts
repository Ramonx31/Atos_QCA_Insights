import type { ActMetric, CalculatedActRecord } from "@/types/acts";

const percentage = (value: number, total: number) => total === 0 ? 0 : (value / total) * 100;

/** Fonte única para as regras matemáticas confirmadas do produto. */
export function calculateActMetrics<T extends ActMetric>(record: T): T & {
  total: number;
  manualPercentage: number;
  automatedPercentage: number;
} {
  const total = record.manual + record.automated;
  return {
    ...record,
    total,
    manualPercentage: percentage(record.manual, total),
    automatedPercentage: percentage(record.automated, total),
  };
}

export function toCalculatedActRecord(record: CalculatedActRecord) {
  return calculateActMetrics(record);
}
