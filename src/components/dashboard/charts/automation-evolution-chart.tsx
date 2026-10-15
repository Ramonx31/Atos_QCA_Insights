"use client";

import { useMemo } from "react";
import type { EChartsOption } from "echarts";
import { EChart } from "@/components/dashboard/charts/echart";
import type { DashboardFact } from "@/server/dashboard/types";

const competenceLabel = (competence: string) => {
  const [year, month] = competence.split("-");
  const months = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  return `${months[Number(month) - 1] ?? month}/${year}`;
};

export function AutomationEvolutionChart({ facts }: { facts: DashboardFact[] }) {
  const option = useMemo<EChartsOption>(() => {
    const periods = new Map<string, { manual: number; automated: number }>();
    for (const fact of facts) {
      const current = periods.get(fact.competence) ?? { manual: 0, automated: 0 };
      current.manual += fact.manual;
      current.automated += fact.automated;
      periods.set(fact.competence, current);
    }
    const entries = [...periods.entries()].sort(([left], [right]) => left.localeCompare(right));
    const automationRate = entries.map(([, value]) => value.manual + value.automated ? value.automated / (value.manual + value.automated) * 100 : 0);
    return { tooltip: { trigger: "axis", axisPointer: { type: "shadow" } }, legend: { bottom: 0 }, grid: { left: 58, right: 58, top: 28, bottom: 52 }, xAxis: { type: "category", data: entries.map(([competence]) => competenceLabel(competence)), axisLabel: { fontSize: 12, color: "#475569" } }, yAxis: [{ type: "value", name: "Atos", axisLabel: { fontSize: 11 } }, { type: "value", name: "% automatizado", min: 0, max: 100, axisLabel: { formatter: "{value}%", fontSize: 11 } }], series: [{ name: "Manual", type: "bar", stack: "volume", data: entries.map(([, value]) => value.manual), itemStyle: { color: "#e11d48", borderRadius: [3, 3, 0, 0] } }, { name: "Automatizado", type: "bar", stack: "volume", data: entries.map(([, value]) => value.automated), itemStyle: { color: "#2563eb", borderRadius: [3, 3, 0, 0] } }, { name: "% automatizado", type: "line", yAxisIndex: 1, data: automationRate, itemStyle: { color: "#059669" }, lineStyle: { width: 3 }, symbolSize: 7, smooth: true }] };
  }, [facts]);
  return <EChart option={option} ariaLabel="Evolução mensal dos atos manuais e automatizados" style={{ height: 390 }} />;
}
