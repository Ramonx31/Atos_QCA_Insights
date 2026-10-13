"use client";

import { useMemo } from "react";
import type { EChartsOption } from "echarts";
import { EChart } from "@/components/dashboard/charts/echart";
import type { DashboardActAggregate } from "@/components/dashboard/calculations";

export function VolumeManualChart({ acts }: { acts: DashboardActAggregate[] }) {
  const option = useMemo<EChartsOption>(() => ({ tooltip: { formatter: (params: unknown) => { const item = params as { data: [number, number, string] }; return `${item.data[2]}<br/>Volume: ${item.data[0].toLocaleString("pt-BR")}<br/>% Manual: ${item.data[1].toFixed(1)}%`; } }, grid: { left: 55, right: 28, top: 28, bottom: 48 }, xAxis: { type: "value", name: "Volume" }, yAxis: { type: "value", name: "% Manual", min: 0, max: 100, axisLabel: { formatter: "{value}%" } }, series: [{ type: "scatter", symbolSize: 14, itemStyle: { color: "#7c3aed" }, data: acts.map((act) => [act.total, act.manualPercentage, act.actName]) }] }), [acts]);
  return <EChart option={option} ariaLabel="Dispersão de volume e percentual manual por ato" />;
}
