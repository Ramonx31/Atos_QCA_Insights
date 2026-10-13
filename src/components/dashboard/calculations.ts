import type { DashboardFact, DashboardFilters } from "@/server/dashboard/types";

export interface DashboardActAggregate {
  actName: string;
  manual: number;
  automated: number;
  total: number;
  manualPercentage: number;
  automatedPercentage: number;
}

const includesAny = (values: string[], selected: string[]) => selected.length === 0 || values.some((value) => selected.includes(value));

export function filterDashboardFacts(facts: DashboardFact[], filters: DashboardFilters) {
  return facts.filter((fact) =>
    includesAny([fact.competence], filters.competences) &&
    includesAny(fact.directorates, filters.directorates) &&
    includesAny(fact.costCenter ? [fact.costCenter] : [], filters.costCenters) &&
    includesAny(fact.cells, filters.cells) &&
    includesAny(fact.managers, filters.managers) &&
    includesAny([fact.actName], filters.acts),
  );
}

export function aggregateActs(facts: DashboardFact[]): DashboardActAggregate[] {
  const grouped = new Map<string, { manual: number; automated: number }>();
  for (const fact of facts) {
    const current = grouped.get(fact.actName) ?? { manual: 0, automated: 0 };
    current.manual += fact.manual;
    current.automated += fact.automated;
    grouped.set(fact.actName, current);
  }
  return [...grouped.entries()].map(([actName, values]) => {
    const total = values.manual + values.automated;
    return { actName, ...values, total, manualPercentage: total ? values.manual / total * 100 : 0, automatedPercentage: total ? values.automated / total * 100 : 0 };
  }).sort((left, right) => right.total - left.total || left.actName.localeCompare(right.actName, "pt-BR"));
}

export function calculateDashboardKpis(acts: DashboardActAggregate[]) {
  const manual = acts.reduce((sum, act) => sum + act.manual, 0);
  const automated = acts.reduce((sum, act) => sum + act.automated, 0);
  const total = manual + automated;
  return { total, manual, automated, manualPercentage: total ? manual / total * 100 : 0, automatedPercentage: total ? automated / total * 100 : 0 };
}

export function getFilterOptions(facts: DashboardFact[]) {
  const unique = (values: string[]) => [...new Set(values)].sort((a, b) => a.localeCompare(b, "pt-BR"));
  return {
    competences: unique(facts.map((fact) => fact.competence)),
    directorates: unique(facts.flatMap((fact) => fact.directorates)),
    costCenters: unique(facts.flatMap((fact) => fact.costCenter ? [fact.costCenter] : [])),
    cells: unique(facts.flatMap((fact) => fact.cells)),
    managers: unique(facts.flatMap((fact) => fact.managers)),
    acts: unique(facts.map((fact) => fact.actName)),
  };
}
