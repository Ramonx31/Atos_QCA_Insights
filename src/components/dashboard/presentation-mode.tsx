"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { ActComparisonChart } from "@/components/dashboard/charts/act-comparison-chart";
import { ParetoChart } from "@/components/dashboard/charts/pareto-chart";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { Card } from "@/components/ui/card";
import type { DashboardActAggregate } from "@/components/dashboard/calculations";

type Kpis = { total: number; manual: number; automated: number; manualPercentage: number; automatedPercentage: number };

export function PresentationMode({ acts, kpis, onClose }: { acts: DashboardActAggregate[]; kpis: Kpis; onClose: () => void }) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-50 p-4 md:p-8">
    <div className="mx-auto max-w-[1600px] space-y-6"><header className="flex items-start justify-between gap-4"><div><p className="text-sm font-semibold text-primary">QCA Insights · Modo apresentação</p><h2 className="text-3xl font-bold tracking-tight">Automação de atos</h2><p className="mt-1 text-muted-foreground">Visão consolidada do conjunto filtrado.</p></div><button type="button" onClick={onClose} className="inline-flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm font-medium shadow-sm"><X size={16} /> Sair (Esc)</button></header>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5"><SummaryCard label="Total de atos" value={kpis.total} caption="manual + automatizado" /><SummaryCard label="Manuais" value={kpis.manual} caption={`${kpis.manualPercentage.toFixed(1)}%`} /><SummaryCard label="Automatizados" value={kpis.automated} caption={`${kpis.automatedPercentage.toFixed(1)}%`} /><SummaryCard label="% manual" value={Number(kpis.manualPercentage.toFixed(1))} suffix="%" caption="dos atos filtrados" /><SummaryCard label="% automatizado" value={Number(kpis.automatedPercentage.toFixed(1))} suffix="%" caption="dos atos filtrados" /></div>
      <div className="grid gap-6 xl:grid-cols-2"><Card className="p-6"><h3 className="font-semibold">Manual x automatizado por ato</h3><p className="mb-3 text-sm text-muted-foreground">Volumes absolutos por ato.</p><ActComparisonChart acts={acts} mode="values" /></Card><Card className="p-6"><h3 className="font-semibold">Pareto de atos manuais</h3><p className="mb-3 text-sm text-muted-foreground">Atos priorizados por volume manual.</p><ParetoChart acts={acts} /></Card></div>
    </div>
  </div>;
}
