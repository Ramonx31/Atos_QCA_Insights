"use client";

import { useMemo, useState } from "react";
import { ActComparisonChart } from "@/components/dashboard/charts/act-comparison-chart";
import { ParetoChart } from "@/components/dashboard/charts/pareto-chart";
import { VolumeManualChart } from "@/components/dashboard/charts/volume-manual-chart";
import { ActDetailTable } from "@/components/dashboard/act-detail-table";
import { aggregateActs, calculateDashboardKpis, filterDashboardFacts, getFilterOptions } from "@/components/dashboard/calculations";
import { DisplayModeControl } from "@/components/dashboard/display-mode-control";
import { DashboardExportButtons } from "@/components/dashboard/export/dashboard-export-buttons";
import { FilterMultiSelect } from "@/components/dashboard/filter-multiselect";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { Card } from "@/components/ui/card";
import type { DashboardFact, DashboardFilters, DisplayMode } from "@/server/dashboard/types";
import { generateDeterministicInsights } from "@/server/insights/deterministic-insight-engine";

const initialFilters: DashboardFilters = { competences: [], directorates: [], costCenters: [], cells: [], managers: [], acts: [] };
const percentage = (value: number) => `${value.toFixed(1)}%`;

export function ActsDashboard({ facts }: { facts: DashboardFact[] }) {
  const [filters, setFilters] = useState<DashboardFilters>(initialFilters);
  const [mode, setMode] = useState<DisplayMode>("values");
  const options = useMemo(() => getFilterOptions(facts), [facts]);
  const filteredFacts = useMemo(() => filterDashboardFacts(facts, filters), [facts, filters]);
  const acts = useMemo(() => aggregateActs(filteredFacts), [filteredFacts]);
  const kpis = useMemo(() => calculateDashboardKpis(acts), [acts]);
  const insights = useMemo(() => generateDeterministicInsights({ currentActs: acts }), [acts]);
  const exportSnapshot = useMemo(() => ({ filters, kpis, acts, insights, generatedAt: new Date() }), [filters, kpis, acts, insights]);
  const updateFilter = (key: keyof DashboardFilters) => (values: string[]) => setFilters((current) => ({ ...current, [key]: values }));

  return <div className="space-y-6"><div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end"><div><p className="text-sm font-medium text-primary">Dados persistidos</p><h2 className="text-3xl font-bold tracking-tight">Dashboard de atos</h2><p className="mt-2 text-muted-foreground">Indicadores, gráficos e tabela usam a mesma população filtrada.</p></div><div className="flex flex-wrap items-center gap-3"><DashboardExportButtons snapshot={exportSnapshot} /><DisplayModeControl value={mode} onChange={setMode} /></div></div><Card className="p-4"><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6"><FilterMultiSelect label="Competência" options={options.competences} selected={filters.competences} onChange={updateFilter("competences")} /><FilterMultiSelect label="Diretoria" options={options.directorates} selected={filters.directorates} onChange={updateFilter("directorates")} /><FilterMultiSelect label="Centro de custo" options={options.costCenters} selected={filters.costCenters} onChange={updateFilter("costCenters")} /><FilterMultiSelect label="Célula" options={options.cells} selected={filters.cells} onChange={updateFilter("cells")} /><FilterMultiSelect label="Gestor" options={options.managers} selected={filters.managers} onChange={updateFilter("managers")} /><FilterMultiSelect label="Atos" options={options.acts} selected={filters.acts} onChange={updateFilter("acts")} searchable /></div></Card><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5"><SummaryCard label="Total de atos" value={kpis.total} caption="manual + automatizado" /><SummaryCard label="Manuais" value={kpis.manual} caption={percentage(kpis.manualPercentage)} /><SummaryCard label="Automatizados" value={kpis.automated} caption={percentage(kpis.automatedPercentage)} /><SummaryCard label="% manual" value={Number(kpis.manualPercentage.toFixed(1))} suffix="%" caption="dos atos filtrados" /><SummaryCard label="% automatizado" value={Number(kpis.automatedPercentage.toFixed(1))} suffix="%" caption="dos atos filtrados" /></div>{facts.length === 0 ? <Card className="p-8 text-center text-muted-foreground">Ainda não há dados para exibir. Envie um screenshot acima e confirme a leitura para preencher o painel.</Card> : <><div className="grid gap-6 xl:grid-cols-2"><Card className="p-5"><h3 className="font-semibold">Manual x automatizado por ato</h3><p className="mb-3 text-sm text-muted-foreground">Comparação por volume e modo selecionado.</p><ActComparisonChart acts={acts} mode={mode} /></Card><Card className="p-5"><h3 className="font-semibold">Pareto de atos manuais</h3><p className="mb-3 text-sm text-muted-foreground">Prioriza os atos com maior volume manual.</p><ParetoChart acts={acts} /></Card><Card className="p-5 xl:col-span-2"><h3 className="font-semibold">Volume x % manual</h3><p className="mb-3 text-sm text-muted-foreground">Relação entre volume total e participação manual.</p><VolumeManualChart acts={acts} /></Card></div><Card className="overflow-hidden"><div className="border-b px-5 py-4"><h3 className="font-semibold">Detalhamento por ato</h3></div><ActDetailTable data={acts} /></Card></>}</div>;
}
