"use client";

import { useEffect } from "react";
import { Bot, TriangleAlert, X } from "lucide-react";
import { ActComparisonChart } from "@/components/dashboard/charts/act-comparison-chart";
import { AutomationEvolutionChart } from "@/components/dashboard/charts/automation-evolution-chart";
import { AutomationOpportunityChart } from "@/components/dashboard/charts/automation-opportunity-chart";
import { SummaryCard } from "@/components/dashboard/summary-card";
import type { DashboardActAggregate } from "@/components/dashboard/calculations";
import { Card } from "@/components/ui/card";
import { isExcludedFromManualAttention, isNonAutomatedAct } from "@/lib/non-automated-acts";
import type { DashboardFact } from "@/server/dashboard/types";

type Kpis = { total: number; manual: number; automated: number; manualPercentage: number; automatedPercentage: number };

export function PresentationMode({ acts, facts, kpis, onClose }: { acts: DashboardActAggregate[]; facts: DashboardFact[]; kpis: Kpis; onClose: () => void }) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const noAutomationAlerts = acts.filter((act) => isNonAutomatedAct(act.actName)).sort((a, b) => b.manual - a.manual);
  const manualAlerts = acts.filter((act) => act.manual > act.automated && !isExcludedFromManualAttention(act.actName)).sort((a, b) => (b.manual - b.automated) - (a.manual - a.automated) || b.manual - a.manual);

  return <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-50 p-5 md:p-8">
    <div className="mx-auto max-w-[1800px] space-y-7">
      <header className="flex items-start justify-between gap-4"><div><p className="text-base font-semibold text-primary">QCA Insights · Modo apresentação</p><h2 className="mt-1 text-4xl font-bold tracking-tight">Automação de atos</h2><p className="mt-2 text-lg text-muted-foreground">Visão consolidada do conjunto filtrado.</p></div><button type="button" onClick={onClose} className="inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2.5 text-base font-medium shadow-sm"><X size={18} /> Sair (Esc)</button></header>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5"><SummaryCard label="Total de atos" value={kpis.total} caption="manual + automatizado" /><SummaryCard label="Manuais" value={kpis.manual} caption={`${kpis.manualPercentage.toFixed(1)}%`} /><SummaryCard label="Automatizados" value={kpis.automated} caption={`${kpis.automatedPercentage.toFixed(1)}%`} /><SummaryCard label="% manual" value={Number(kpis.manualPercentage.toFixed(1))} suffix="%" caption="dos atos filtrados" /><SummaryCard label="% automatizado" value={Number(kpis.automatedPercentage.toFixed(1))} suffix="%" caption="dos atos filtrados" /></div>

      <section><div className="mb-4"><p className="text-base font-semibold text-primary">Prioridades</p><h3 className="text-2xl font-bold tracking-tight">Onde concentrar a atenção</h3><p className="mt-1 text-base text-muted-foreground">Atos sem automação e oportunidades que demandam ação da equipe.</p></div><div className="grid gap-6 xl:grid-cols-2">
        <Card className="border-red-200 bg-red-50/70 p-6"><div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-xl bg-red-100 text-red-700"><Bot size={21} /></span><div><h4 className="text-lg font-bold text-red-950">Sem automação disponível</h4><p className="text-sm text-red-900">{noAutomationAlerts.length} atos mapeados</p></div></div>{noAutomationAlerts.length ? <ul className="mt-5 divide-y divide-red-100 rounded-lg border border-red-200 bg-white">{noAutomationAlerts.slice(0, 6).map((act) => <li key={act.actName} className="flex items-center justify-between gap-4 px-4 py-3 text-base"><span className="font-medium text-red-950">{act.actName}</span><span className="shrink-0 font-semibold tabular-nums text-red-800">{act.manual.toLocaleString("pt-BR")} manual</span></li>)}</ul> : <p className="mt-5 text-base text-muted-foreground">Nenhum ato no recorte atual.</p>}</Card>
        <Card className="border-amber-200 bg-amber-50/70 p-6"><div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-xl bg-amber-100 text-amber-800"><TriangleAlert size={21} /></span><div><h4 className="text-lg font-bold text-amber-950">Predominância manual</h4><p className="text-sm text-amber-900">{manualAlerts.length} atos a priorizar</p></div></div>{manualAlerts.length ? <ul className="mt-5 divide-y divide-amber-100 rounded-lg border border-amber-200 bg-white">{manualAlerts.slice(0, 6).map((act) => <li key={act.actName} className="flex items-center justify-between gap-4 px-4 py-3 text-base"><span className="font-medium text-slate-900">{act.actName}</span><span className="shrink-0 text-right text-amber-900"><strong className="tabular-nums">{act.manual.toLocaleString("pt-BR")}</strong> manual · {act.automated.toLocaleString("pt-BR")} auto.</span></li>)}</ul> : <p className="mt-5 text-base text-emerald-700">Nenhum ato no recorte possui predominância manual.</p>}</Card>
      </div></section>

      <div className="grid gap-6 xl:grid-cols-2"><Card className="p-7"><h3 className="text-xl font-bold">Manual x automatizado por ato</h3><p className="mb-4 text-base text-muted-foreground">Volumes absolutos dos atos com maior impacto.</p><ActComparisonChart acts={acts} mode="values" presentation /></Card><Card className="p-7"><h3 className="text-xl font-bold">Oportunidades de automação</h3><p className="mb-4 text-base text-muted-foreground">Atos com maior potencial de reduzir trabalho manual.</p><AutomationOpportunityChart acts={acts} presentation /></Card></div>
      <Card className="p-7"><h3 className="text-xl font-bold">Evolução da automação por competência</h3><p className="mb-4 text-base text-muted-foreground">Volume manual, automatizado e taxa de automação em cada período.</p><AutomationEvolutionChart facts={facts} /></Card>
    </div>
  </div>;
}
