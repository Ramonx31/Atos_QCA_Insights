"use client";

import { useMemo, useState } from "react";
import { BarChart3, Bot, ChevronDown, ClipboardList, Filter, Maximize2, RefreshCw, TriangleAlert } from "lucide-react";
import { ActDetailTable } from "@/components/dashboard/act-detail-table";
import { ActComparisonChart } from "@/components/dashboard/charts/act-comparison-chart";
import { AutomationEvolutionChart } from "@/components/dashboard/charts/automation-evolution-chart";
import { AutomationOpportunityChart } from "@/components/dashboard/charts/automation-opportunity-chart";
import { aggregateActs, calculateDashboardKpis, filterDashboardFacts, getFilterOptions } from "@/components/dashboard/calculations";
import { DisplayModeControl } from "@/components/dashboard/display-mode-control";
import { DashboardExportButtons } from "@/components/dashboard/export/dashboard-export-buttons";
import { FilterMultiSelect } from "@/components/dashboard/filter-multiselect";
import { PresentationMode } from "@/components/dashboard/presentation-mode";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { Card } from "@/components/ui/card";
import { isExcludedFromManualAttention, isNonAutomatedAct } from "@/lib/non-automated-acts";
import type { DashboardFact, DashboardFilters, DisplayMode } from "@/server/dashboard/types";
import { generateDeterministicInsights } from "@/server/insights/deterministic-insight-engine";

const initialFilters: DashboardFilters = { competences: [], directorates: [], costCenters: [], cells: [], managers: [], acts: [] };
const percentage = (value: number) => `${value.toFixed(1)}%`;
const number = (value: number) => value.toLocaleString("pt-BR");

export function ActsDashboard({ facts }: { facts: DashboardFact[] }) {
  const [filters, setFilters] = useState<DashboardFilters>(initialFilters);
  const [mode, setMode] = useState<DisplayMode>("values");
  const [presentationMode, setPresentationMode] = useState(false);
  const [showAllNoAutomation, setShowAllNoAutomation] = useState(false);
  const [showAllManualAlerts, setShowAllManualAlerts] = useState(false);
  const options = useMemo(() => getFilterOptions(facts), [facts]);
  const filteredFacts = useMemo(() => filterDashboardFacts(facts, filters), [facts, filters]);
  const acts = useMemo(() => aggregateActs(filteredFacts), [filteredFacts]);
  const kpis = useMemo(() => calculateDashboardKpis(acts), [acts]);
  const insights = useMemo(() => generateDeterministicInsights({ currentActs: acts }), [acts]);
  const manualAlerts = useMemo(() => acts.filter((act) => act.manual > act.automated && !isExcludedFromManualAttention(act.actName)).sort((a, b) => (b.manual - b.automated) - (a.manual - a.automated) || b.manual - a.manual), [acts]);
  const noAutomationAlerts = useMemo(() => acts.filter((act) => isNonAutomatedAct(act.actName)).sort((a, b) => b.manual - a.manual), [acts]);
  const visibleNoAutomationAlerts = showAllNoAutomation ? noAutomationAlerts : noAutomationAlerts.slice(0, 5);
  const visibleManualAlerts = showAllManualAlerts ? manualAlerts : manualAlerts.slice(0, 5);
  const topManualAct = useMemo(() => [...acts].sort((a, b) => b.manual - a.manual)[0], [acts]);
  const activeFilterCount = useMemo(() => Object.values(filters).reduce((total, values) => total + values.length, 0), [filters]);
  const exportSnapshot = useMemo(() => ({ filters, kpis, acts, insights, generatedAt: new Date() }), [filters, kpis, acts, insights]);
  const updateFilter = (key: keyof DashboardFilters) => (values: string[]) => setFilters((current) => ({ ...current, [key]: values }));
  const clearFilters = () => setFilters(initialFilters);

  return <div className="space-y-6">
    <header className="flex flex-col gap-5 rounded-2xl border border-primary/10 bg-gradient-to-br from-white via-white to-blue-50/70 p-5 shadow-sm lg:flex-row lg:items-end lg:justify-between lg:p-7">
      <div className="max-w-2xl"><p className="text-sm font-semibold text-primary">Visão operacional</p><h2 className="mt-1 text-3xl font-bold tracking-tight">Dashboard de automação</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Acompanhe onde o trabalho manual se concentra e quais atos devem ser priorizados pela equipe.</p></div>
      <div className="flex flex-wrap items-center gap-2"><button type="button" onClick={() => setPresentationMode(true)} className="inline-flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-slate-50"><Maximize2 size={16} />Apresentar</button><DashboardExportButtons snapshot={exportSnapshot} /><DisplayModeControl value={mode} onChange={setMode} /></div>
    </header>

    <details className="group rounded-xl border bg-white shadow-sm">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-lg bg-slate-100 text-slate-700"><Filter size={17} /></span><div><p className="font-semibold">Filtros de análise</p><p className="text-sm text-muted-foreground">{activeFilterCount ? `${activeFilterCount} filtro${activeFilterCount > 1 ? "s" : ""} aplicado${activeFilterCount > 1 ? "s" : ""}` : "Todos os dados persistidos"}</p></div></div><div className="flex items-center gap-3">{activeFilterCount ? <button type="button" onClick={(event) => { event.preventDefault(); clearFilters(); }} className="text-sm font-medium text-primary hover:underline">Limpar filtros</button> : null}<ChevronDown size={18} className="transition-transform group-open:rotate-180" /></div></summary>
      <div className="border-t px-5 py-5"><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6"><FilterMultiSelect label="Competência" options={options.competences} selected={filters.competences} onChange={updateFilter("competences")} /><FilterMultiSelect label="Diretoria" options={options.directorates} selected={filters.directorates} onChange={updateFilter("directorates")} /><FilterMultiSelect label="Centro de custo" options={options.costCenters} selected={filters.costCenters} onChange={updateFilter("costCenters")} /><FilterMultiSelect label="Célula" options={options.cells} selected={filters.cells} onChange={updateFilter("cells")} /><FilterMultiSelect label="Gestor" options={options.managers} selected={filters.managers} onChange={updateFilter("managers")} /><FilterMultiSelect label="Atos" options={options.acts} selected={filters.acts} onChange={updateFilter("acts")} searchable /></div></div>
    </details>

    <section aria-label="Indicadores principais"><div className="mb-3 flex items-center gap-2"><BarChart3 size={18} className="text-primary" /><h3 className="font-semibold">Resumo do período</h3><span className="text-sm text-muted-foreground">{acts.length} atos no recorte atual</span></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5"><SummaryCard label="Total de atos" value={kpis.total} caption="manual + automatizado" icon={<ClipboardList size={18} />} tone="primary" /><SummaryCard label="Manuais" value={kpis.manual} caption={`${percentage(kpis.manualPercentage)} do total`} icon={<TriangleAlert size={18} />} tone="manual" /><SummaryCard label="Automatizados" value={kpis.automated} caption={`${percentage(kpis.automatedPercentage)} do total`} icon={<Bot size={18} />} tone="automated" /><SummaryCard label="Taxa manual" value={Number(kpis.manualPercentage.toFixed(1))} suffix="%" caption="quanto menor, melhor" tone="manual" /><SummaryCard label="Taxa automatizada" value={Number(kpis.automatedPercentage.toFixed(1))} suffix="%" caption="quanto maior, melhor" tone="automated" /></div></section>

    {facts.length === 0 ? <Card className="p-10 text-center"><ClipboardList className="mx-auto text-muted-foreground" size={28} /><h3 className="mt-3 font-semibold">Nenhum dado para analisar</h3><p className="mt-1 text-sm text-muted-foreground">Envie um PDF e confirme a leitura para preencher o dashboard.</p></Card> : <>
      <Card className="border-primary/15 bg-gradient-to-r from-primary/[0.06] to-blue-50 p-5"><div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div className="flex gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground"><RefreshCw size={19} /></span><div><p className="font-semibold">Leitura rápida</p><p className="mt-1 text-sm leading-6 text-slate-700">{topManualAct ? <><strong>{topManualAct.actName}</strong> é o ato com maior volume manual, com {number(topManualAct.manual)} registros. A equipe deve começar a análise por esse ponto.</> : "Não há atos no recorte atual."}</p></div></div><a href="#detalhamento" className="shrink-0 text-sm font-semibold text-primary hover:underline">Ver detalhamento completo</a></div></Card>

      <section aria-label="Prioridades de atuação"><div className="mb-3"><p className="text-sm font-semibold text-primary">Prioridades</p><h3 className="text-xl font-bold tracking-tight">Onde concentrar a atenção</h3><p className="mt-1 text-sm text-muted-foreground">Os cartões mostram os principais itens; a tabela abaixo contém a relação completa.</p></div><div className="grid gap-5 xl:grid-cols-2">
        <Card className="border-red-200 bg-red-50/70 p-5"><div className="flex items-start justify-between gap-3"><div className="flex gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-red-100 text-red-700"><Bot size={19} /></span><div><h4 className="font-semibold text-red-950">Sem automação disponível</h4><p className="mt-1 text-sm text-red-900">Atos mapeados como não automatizados.</p></div></div><span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-red-800">{noAutomationAlerts.length} atos</span></div>{noAutomationAlerts.length ? <ul className="mt-4 divide-y divide-red-100 rounded-lg border border-red-200 bg-white">{visibleNoAutomationAlerts.map((act) => <li key={act.actName} className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm"><span className="font-medium text-red-950">{act.actName}</span><span className="shrink-0 font-semibold tabular-nums text-red-800">{number(act.manual)} manual</span></li>)}</ul> : <p className="mt-4 rounded-lg bg-white p-3 text-sm text-muted-foreground">Nenhum ato mapeado está presente no filtro atual.</p>}{noAutomationAlerts.length > 5 ? <button type="button" onClick={() => setShowAllNoAutomation((current) => !current)} className="mt-3 inline-block text-sm font-semibold text-red-800 hover:underline">{showAllNoAutomation ? "Mostrar menos" : `Ver mais ${noAutomationAlerts.length - 5} atos`}</button> : null}</Card>
        <Card className="border-amber-200 bg-amber-50/70 p-5"><div className="flex items-start justify-between gap-3"><div className="flex gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-800"><TriangleAlert size={19} /></span><div><h4 className="font-semibold text-amber-950">Predominância manual</h4><p className="mt-1 text-sm text-amber-900">Atos que devem ser priorizados para revisão ou automação.</p></div></div><span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-amber-800">{manualAlerts.length} atos</span></div>{manualAlerts.length ? <ul className="mt-4 divide-y divide-amber-100 rounded-lg border border-amber-200 bg-white">{visibleManualAlerts.map((act) => <li key={act.actName} className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm"><span className="font-medium text-slate-900">{act.actName}</span><span className="shrink-0 text-right text-amber-900"><strong className="tabular-nums">{number(act.manual)}</strong><span className="text-muted-foreground"> manual · {number(act.automated)} auto.</span></span></li>)}</ul> : <p className="mt-4 rounded-lg bg-white p-3 text-sm text-emerald-700">Nenhum ato filtrado possui mais volume manual que automatizado.</p>}{manualAlerts.length > 5 ? <button type="button" onClick={() => setShowAllManualAlerts((current) => !current)} className="mt-3 inline-block text-sm font-semibold text-amber-800 hover:underline">{showAllManualAlerts ? "Mostrar menos" : `Ver mais ${manualAlerts.length - 5} atos`}</button> : null}</Card>
      </div></section>

      <section aria-label="Análise gráfica"><div className="mb-3"><p className="text-sm font-semibold text-primary">Análise visual</p><h3 className="text-xl font-bold tracking-tight">Decisão e acompanhamento</h3><p className="mt-1 text-sm text-muted-foreground">Os gráficos destacam prioridades de automação e a evolução da operação ao longo das competências.</p></div><div className="grid gap-6 xl:grid-cols-2"><Card className="p-5"><div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold">Manual x automatizado</h3><p className="mt-1 text-sm text-muted-foreground">Comparação de volume dos atos com maior impacto.</p></div></div><ActComparisonChart acts={acts} mode={mode} /></Card><Card className="p-5"><div><h3 className="font-semibold">Oportunidades de automação</h3><p className="mt-1 text-sm text-muted-foreground">Prioriza atos automatizáveis pelo potencial de reduzir trabalho manual.</p></div><AutomationOpportunityChart acts={acts} /></Card><Card className="p-5 xl:col-span-2"><h3 className="font-semibold">Evolução da automação por competência</h3><p className="mb-3 text-sm text-muted-foreground">Acompanhe o volume manual, automatizado e a taxa de automação em cada período.</p><AutomationEvolutionChart facts={filteredFacts} /></Card></div></section>

      <Card id="detalhamento" className="overflow-hidden scroll-mt-6"><div className="flex flex-wrap items-center justify-between gap-3 border-b bg-slate-50 px-5 py-4"><div><h3 className="font-semibold">Detalhamento por ato</h3><p className="mt-1 text-sm text-muted-foreground">Base completa do recorte selecionado.</p></div><span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-muted-foreground shadow-sm">{acts.length} atos</span></div><ActDetailTable data={acts} /></Card>
    </>}
    {presentationMode ? <PresentationMode acts={acts} facts={filteredFacts} kpis={kpis} onClose={() => setPresentationMode(false)} /> : null}
  </div>;
}
