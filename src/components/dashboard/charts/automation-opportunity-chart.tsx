"use client";

import { useMemo } from "react";
import type { EChartsOption } from "echarts";
import { EChart } from "@/components/dashboard/charts/echart";
import type { DashboardActAggregate } from "@/components/dashboard/calculations";
import { isNonAutomatedAct } from "@/lib/non-automated-acts";

export function AutomationOpportunityChart({ acts, limit = 10, presentation = false }: { acts: DashboardActAggregate[]; limit?: number; presentation?: boolean }) {
  const option = useMemo<EChartsOption>(() => {
    const opportunities = acts.filter((act) => act.manual > act.automated && !isNonAutomatedAct(act.actName)).map((act) => ({ ...act, potential: act.manual - act.automated })).sort((left, right) => right.potential - left.potential).slice(0, limit).reverse();
    return { tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, formatter: (params) => { const point = Array.isArray(params) ? params[0] : params; const act = opportunities[point.dataIndex]; return `<strong>${act.actName}</strong><br/>Potencial de redução: ${act.potential.toLocaleString("pt-BR")} atos<br/>Manual: ${act.manual.toLocaleString("pt-BR")} · Automatizado: ${act.automated.toLocaleString("pt-BR")}`; } }, grid: { left: presentation ? 265 : 220, right: 34, top: 24, bottom: 34 }, xAxis: { type: "value", name: "Potencial de redução manual", nameTextStyle: { fontSize: presentation ? 13 : 12 }, axisLabel: { fontSize: presentation ? 12 : 11 } }, yAxis: { type: "category", data: opportunities.map((act) => act.actName), axisLabel: { width: presentation ? 240 : 195, overflow: "break", lineHeight: presentation ? 18 : 14, fontSize: presentation ? 14 : 12, color: "#334155", fontWeight: presentation ? 500 : 400 } }, series: [{ name: "Potencial de redução", type: "bar", data: opportunities.map((act) => act.potential), itemStyle: { color: "#d97706", borderRadius: [0, 4, 4, 0] }, label: { show: !presentation, position: "right", formatter: ({ value }) => Number(value).toLocaleString("pt-BR"), color: "#92400e", fontWeight: 600 } }] };
  }, [acts, limit, presentation]);
  return <EChart option={option} ariaLabel="Ranking de oportunidades de automação" style={{ height: Math.max(presentation ? 460 : 330, Math.min(limit, acts.length) * (presentation ? 48 : 38) + 74) }} />;
}
