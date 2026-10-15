"use client";

import { useMemo } from "react";
import type { EChartsOption } from "echarts";
import { EChart } from "@/components/dashboard/charts/echart";
import type { DashboardActAggregate } from "@/components/dashboard/calculations";

export function ParetoChart({ acts, limit = 12, presentation = false }: { acts: DashboardActAggregate[]; limit?: number; presentation?: boolean }) {
  const option = useMemo<EChartsOption>(() => {
    const sorted = [...acts].sort((a, b) => b.manual - a.manual);
    const total = sorted.reduce((sum, act) => sum + act.manual, 0);
    const visibleActs = sorted.slice(0, limit);
    let accumulated = 0;
    const cumulative = visibleActs.map((act) => { accumulated += act.manual; return total ? accumulated / total * 100 : 0; });
    const labelFontSize = presentation ? 14 : 12;
    return { tooltip: { trigger: "axis", axisPointer: { type: "shadow" } }, grid: { left: presentation ? 265 : 210, right: 72, top: 46, bottom: 34 }, xAxis: [{ type: "value", name: "Atos manuais", nameTextStyle: { fontSize: presentation ? 13 : 12 }, axisLabel: { fontSize: presentation ? 12 : 11 } }, { type: "value", name: "% acumulado", min: 0, max: 100, position: "top", axisLabel: { formatter: "{value}%", fontSize: presentation ? 12 : 11 } }], yAxis: { type: "category", inverse: true, data: visibleActs.map((act) => act.actName), axisLabel: { width: presentation ? 240 : 185, overflow: "break", lineHeight: presentation ? 18 : 14, fontSize: labelFontSize, color: "#334155", fontWeight: presentation ? 500 : 400 } }, series: [{ name: "Manuais", type: "bar", data: visibleActs.map((act) => act.manual), itemStyle: { color: "#e11d48", borderRadius: [0, 4, 4, 0] } }, { name: "% acumulado", type: "line", xAxisIndex: 1, data: cumulative, itemStyle: { color: "#2563eb" }, lineStyle: { width: presentation ? 3 : 2 }, symbol: "circle", symbolSize: presentation ? 7 : 6, smooth: true }] };
  }, [acts, limit, presentation]);
  return <EChart option={option} ariaLabel="Pareto dos atos com maior volume manual" className="min-h-80" style={{ height: Math.max(presentation ? 500 : 340, Math.min(limit, acts.length) * (presentation ? 48 : 36) + 84) }} />;
}
