"use client";

import { useMemo } from "react";
import type { EChartsOption } from "echarts";
import { EChart } from "@/components/dashboard/charts/echart";
import type { DashboardActAggregate } from "@/components/dashboard/calculations";

export function ParetoChart({ acts }: { acts: DashboardActAggregate[] }) {
  const option = useMemo<EChartsOption>(() => {
    const sorted = [...acts].sort((a, b) => b.manual - a.manual);
    const total = sorted.reduce((sum, act) => sum + act.manual, 0);
    let accumulated = 0;
    const cumulative = sorted.map((act) => { accumulated += act.manual; return total ? accumulated / total * 100 : 0; });
    return { tooltip: { trigger: "axis", axisPointer: { type: "shadow" } }, grid: { left: 210, right: 64, top: 42, bottom: 28 }, xAxis: [{ type: "value", name: "Manuais" }, { type: "value", name: "% acumulado", min: 0, max: 100, position: "top", axisLabel: { formatter: "{value}%" } }], yAxis: { type: "category", inverse: true, data: sorted.map((act) => act.actName), axisLabel: { width: 185, overflow: "break", lineHeight: 14 } }, series: [{ name: "Manuais", type: "bar", data: sorted.map((act) => act.manual), itemStyle: { color: "#dc2626" } }, { name: "% acumulado", type: "line", xAxisIndex: 1, data: cumulative, itemStyle: { color: "#1d4ed8" }, smooth: true }] };
  }, [acts]);
  return <EChart option={option} ariaLabel="Pareto de atos manuais" className="min-h-96" style={{ height: Math.max(384, acts.length * 34 + 64) }} />;
}
