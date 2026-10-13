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
    return { tooltip: { trigger: "axis" }, grid: { left: 52, right: 52, top: 28, bottom: 92 }, xAxis: { type: "category", data: sorted.map((act) => act.actName), axisLabel: { rotate: 35 } }, yAxis: [{ type: "value", name: "Manuais" }, { type: "value", name: "% acumulado", min: 0, max: 100, axisLabel: { formatter: "{value}%" } }], series: [{ name: "Manuais", type: "bar", data: sorted.map((act) => act.manual), itemStyle: { color: "#dc2626" } }, { name: "% acumulado", type: "line", yAxisIndex: 1, data: cumulative, itemStyle: { color: "#1d4ed8" }, smooth: true }] };
  }, [acts]);
  return <EChart option={option} ariaLabel="Pareto de atos manuais" />;
}
