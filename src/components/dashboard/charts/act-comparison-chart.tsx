"use client";

import { useMemo } from "react";
import type { EChartsOption } from "echarts";
import { EChart } from "@/components/dashboard/charts/echart";
import type { DashboardActAggregate } from "@/components/dashboard/calculations";
import type { DisplayMode } from "@/server/dashboard/types";

export function ActComparisonChart({ acts, mode }: { acts: DashboardActAggregate[]; mode: DisplayMode }) {
  const option = useMemo<EChartsOption>(() => ({ tooltip: { trigger: "axis", axisPointer: { type: "shadow" } }, legend: { bottom: 0 }, grid: { left: 210, right: 46, top: mode === "both" ? 44 : 24, bottom: 50 }, xAxis: mode === "both" ? [{ type: "value", name: "Volume" }, { type: "value", name: "%", min: 0, max: 100, position: "top", axisLabel: { formatter: "{value}%" } }] : { type: "value", min: mode === "percentages" ? 0 : undefined, max: mode === "percentages" ? 100 : undefined, axisLabel: mode === "percentages" ? { formatter: "{value}%" } : undefined }, yAxis: { type: "category", data: acts.map((act) => act.actName).reverse(), axisLabel: { width: 185, overflow: "break", lineHeight: 14 } }, series: [
    ...(mode !== "percentages" ? [{ name: "Manual", type: "bar" as const, stack: "volume", itemStyle: { color: "#dc2626" }, data: acts.map((act) => act.manual).reverse() }, { name: "Automatizado", type: "bar" as const, stack: "volume", itemStyle: { color: "#2563eb" }, data: acts.map((act) => act.automated).reverse() }] : []),
    ...(mode !== "values" ? [{ name: "% Manual", type: "bar" as const, stack: "percentual", xAxisIndex: mode === "both" ? 1 : 0, itemStyle: { color: "#fca5a5" }, data: acts.map((act) => act.manualPercentage).reverse() }, { name: "% Automatizado", type: "bar" as const, stack: "percentual", xAxisIndex: mode === "both" ? 1 : 0, itemStyle: { color: "#93c5fd" }, data: acts.map((act) => act.automatedPercentage).reverse() }] : []),
  ] }), [acts, mode]);
  return <EChart option={option} ariaLabel="Barras horizontais de atos manuais e automatizados" className="min-h-96" style={{ height: Math.max(384, acts.length * 34 + 86) }} />;
}
