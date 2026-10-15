"use client";

import { useMemo } from "react";
import type { EChartsOption } from "echarts";
import { EChart } from "@/components/dashboard/charts/echart";
import type { DashboardActAggregate } from "@/components/dashboard/calculations";
import type { DisplayMode } from "@/server/dashboard/types";

export function ActComparisonChart({ acts, mode, limit = 12, presentation = false }: { acts: DashboardActAggregate[]; mode: DisplayMode; limit?: number; presentation?: boolean }) {
  const option = useMemo<EChartsOption>(() => {
    const visibleActs = [...acts].sort((left, right) => right.total - left.total).slice(0, limit).reverse();
    const labelFontSize = presentation ? 14 : 12;
    return { tooltip: { trigger: "axis", axisPointer: { type: "shadow" } }, legend: { bottom: 0, textStyle: { fontSize: presentation ? 13 : 12 } }, grid: { left: presentation ? 265 : 210, right: 46, top: mode === "both" ? 44 : 24, bottom: 54 }, xAxis: mode === "both" ? [{ type: "value", name: "Volume", nameTextStyle: { fontSize: presentation ? 13 : 12 }, axisLabel: { fontSize: presentation ? 12 : 11 } }, { type: "value", name: "%", min: 0, max: 100, position: "top", axisLabel: { formatter: "{value}%", fontSize: presentation ? 12 : 11 } }] : { type: "value", min: mode === "percentages" ? 0 : undefined, max: mode === "percentages" ? 100 : undefined, axisLabel: mode === "percentages" ? { formatter: "{value}%", fontSize: presentation ? 12 : 11 } : { fontSize: presentation ? 12 : 11 } }, yAxis: { type: "category", data: visibleActs.map((act) => act.actName), axisLabel: { width: presentation ? 240 : 185, overflow: "break", lineHeight: presentation ? 18 : 14, fontSize: labelFontSize, color: "#334155", fontWeight: presentation ? 500 : 400 } }, series: [
      ...(mode !== "percentages" ? [{ name: "Manual", type: "bar" as const, stack: "volume", itemStyle: { color: "#e11d48", borderRadius: [0, 4, 4, 0] }, data: visibleActs.map((act) => act.manual) }, { name: "Automatizado", type: "bar" as const, stack: "volume", itemStyle: { color: "#2563eb", borderRadius: [0, 4, 4, 0] }, data: visibleActs.map((act) => act.automated) }] : []),
      ...(mode !== "values" ? [{ name: "% Manual", type: "bar" as const, stack: "percentual", xAxisIndex: mode === "both" ? 1 : 0, itemStyle: { color: "#fda4af", borderRadius: [0, 4, 4, 0] }, data: visibleActs.map((act) => act.manualPercentage) }, { name: "% Automatizado", type: "bar" as const, stack: "percentual", xAxisIndex: mode === "both" ? 1 : 0, itemStyle: { color: "#93c5fd", borderRadius: [0, 4, 4, 0] }, data: visibleActs.map((act) => act.automatedPercentage) }] : []),
    ] };
  }, [acts, mode, limit, presentation]);
  return <EChart option={option} ariaLabel="Comparação dos atos com maior volume" className="min-h-80" style={{ height: Math.max(presentation ? 500 : 340, Math.min(limit, acts.length) * (presentation ? 48 : 36) + 96) }} />;
}
