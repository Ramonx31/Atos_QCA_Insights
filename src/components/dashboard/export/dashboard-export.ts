import type { DashboardActAggregate } from "@/components/dashboard/calculations";
import type { DeterministicInsight } from "@/server/insights/deterministic-insight-engine";
import type { DashboardFilters } from "@/server/dashboard/types";

export interface DashboardExportSnapshot {
  filters: DashboardFilters;
  kpis: { total: number; manual: number; automated: number; manualPercentage: number; automatedPercentage: number };
  acts: DashboardActAggregate[];
  insights: DeterministicInsight[];
  generatedAt: Date;
}

const escapeHtml = (value: string) => value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] ?? character);
const number = (value: number) => value.toLocaleString("pt-BR");
const rate = (value: number) => `${value.toFixed(1)}%`;
const selection = (values: string[]) => values.length ? values.map(escapeHtml).join(", ") : "Todos";

function barChart(acts: DashboardActAggregate[]) {
  const max = Math.max(1, ...acts.map((act) => act.total));
  return `<svg viewBox="0 0 760 ${Math.max(150, acts.length * 42 + 50)}" role="img" aria-label="Manual x automatizado por ato">${acts.map((act, index) => { const y = index * 42 + 26; const manual = act.manual / max * 430; const automated = act.automated / max * 430; return `<text x="0" y="${y + 10}" font-size="12">${escapeHtml(act.actName)}</text><rect x="185" y="${y - 5}" width="${manual}" height="12" fill="#dc2626"/><rect x="${185 + manual}" y="${y - 5}" width="${automated}" height="12" fill="#2563eb"/><text x="630" y="${y + 8}" font-size="12">${number(act.total)}</text>`; }).join("")}</svg>`;
}

function paretoChart(acts: DashboardActAggregate[]) {
  const sorted = [...acts].sort((a, b) => b.manual - a.manual);
  const max = Math.max(1, ...sorted.map((act) => act.manual));
  const total = sorted.reduce((sum, act) => sum + act.manual, 0);
  let cumulative = 0;
  const width = Math.max(760, sorted.length * 95);
  const bars = sorted.map((act, index) => { cumulative += act.manual; const height = act.manual / max * 180; const x = 38 + index * 90; return `<rect x="${x}" y="${220 - height}" width="48" height="${height}" fill="#dc2626"/><text x="${x}" y="238" font-size="10">${escapeHtml(act.actName.slice(0, 11))}</text>`; }).join("");
  cumulative = 0;
  const points = sorted.map((act, index) => { cumulative += act.manual; return `${62 + index * 90},${220 - (total ? cumulative / total * 180 : 0)}`; }).join(" ");
  return `<svg viewBox="0 0 ${width} 260" role="img" aria-label="Pareto de atos manuais">${bars}<polyline points="${points}" fill="none" stroke="#1d4ed8" stroke-width="3"/></svg>`;
}

function scatterChart(acts: DashboardActAggregate[]) {
  const maxVolume = Math.max(1, ...acts.map((act) => act.total));
  return `<svg viewBox="0 0 760 270" role="img" aria-label="Volume e percentual manual">${acts.map((act, index) => { const x = 55 + act.total / maxVolume * 650; const y = 225 - act.manualPercentage / 100 * 180; return `<circle cx="${x}" cy="${y}" r="7" fill="#7c3aed"/><text x="${x + 10}" y="${y}" font-size="11">${escapeHtml(act.actName)}</text>`; }).join("")}<line x1="55" y1="225" x2="705" y2="225" stroke="#64748b"/><line x1="55" y1="45" x2="55" y2="225" stroke="#64748b"/><text x="355" y="255" font-size="12">Volume</text><text x="4" y="35" font-size="12">% Manual</text></svg>`;
}

/** Documento autônomo: os dados já filtrados são copiados para o relatório, sem consultar a base. */
export function buildDashboardExportHtml(snapshot: DashboardExportSnapshot): string {
  const filters = [{ label: "Competência", value: snapshot.filters.competences }, { label: "Diretoria", value: snapshot.filters.directorates }, { label: "Centro de custo", value: snapshot.filters.costCenters }, { label: "Célula", value: snapshot.filters.cells }, { label: "Gestor", value: snapshot.filters.managers }, { label: "Atos selecionados", value: snapshot.filters.acts }];
  const rows = snapshot.acts.map((act) => `<tr><td>${escapeHtml(act.actName)}</td><td>${number(act.manual)}</td><td>${number(act.automated)}</td><td>${number(act.total)}</td><td>${rate(act.manualPercentage)}</td><td>${rate(act.automatedPercentage)}</td></tr>`).join("");
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Dashboard de atos</title><style>@page{size:A4 landscape;margin:13mm}*{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#172033;margin:0;font-size:11px}h1{font-size:22px;margin:0 0 4px;color:#123b78}h2{font-size:15px;margin:18px 0 8px}p{margin:3px 0}.meta{color:#526174}.filters{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:14px 0}.filter,.kpi{border:1px solid #dbe3ee;border-radius:6px;padding:7px}.label{display:block;color:#526174;font-size:10px}.kpis{display:grid;grid-template-columns:repeat(5,1fr);gap:8px}.kpi strong{font-size:17px}.chart{break-inside:avoid;border:1px solid #dbe3ee;border-radius:6px;padding:8px;margin:10px 0}.chart svg{width:100%;height:auto;max-height:250px}table{width:100%;border-collapse:collapse}th,td{border-bottom:1px solid #dbe3ee;padding:6px;text-align:left}th{background:#f1f5f9}.insights{padding-left:18px}.footer{margin-top:14px;color:#526174;font-size:10px}@media print{.chart{page-break-inside:avoid}}</style></head><body><header><h1>Painel de Automação de Atos</h1><p class="meta">Gerado em ${escapeHtml(snapshot.generatedAt.toLocaleString("pt-BR"))}</p></header><section class="filters">${filters.map((filter) => `<div class="filter"><span class="label">${filter.label}</span>${selection(filter.value)}</div>`).join("")}</section><section class="kpis"><div class="kpi"><span class="label">Total de atos</span><strong>${number(snapshot.kpis.total)}</strong></div><div class="kpi"><span class="label">Manuais</span><strong>${number(snapshot.kpis.manual)}</strong></div><div class="kpi"><span class="label">Automatizados</span><strong>${number(snapshot.kpis.automated)}</strong></div><div class="kpi"><span class="label">% manual</span><strong>${rate(snapshot.kpis.manualPercentage)}</strong></div><div class="kpi"><span class="label">% automatizado</span><strong>${rate(snapshot.kpis.automatedPercentage)}</strong></div></section><section class="chart"><h2>Manual x automatizado por ato</h2>${barChart(snapshot.acts)}</section><section class="chart"><h2>Pareto de atos manuais</h2>${paretoChart(snapshot.acts)}</section><section class="chart"><h2>Volume x % manual</h2>${scatterChart(snapshot.acts)}</section><section><h2>Insights determinísticos</h2><ul class="insights">${snapshot.insights.map((insight) => `<li>${escapeHtml(insight.message)}</li>`).join("") || "<li>Não há insights para o conjunto filtrado.</li>"}</ul></section><section><h2>Tabela detalhada</h2><table><thead><tr><th>Ato</th><th>Manual</th><th>Automatizado</th><th>Total</th><th>% manual</th><th>% automatizado</th></tr></thead><tbody>${rows}</tbody></table></section><footer class="footer">Relatório baseado exclusivamente no conjunto atualmente filtrado.</footer></body></html>`;
}

export function downloadDashboardHtml(snapshot: DashboardExportSnapshot) {
  const blob = new Blob([buildDashboardExportHtml(snapshot)], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "dashboard-atos.html";
  anchor.click();
  URL.revokeObjectURL(url);
}

/** Abre o documento A4 autônomo para a caixa nativa do navegador, inclusive “Salvar como PDF”. */
export function printDashboardPdf(snapshot: DashboardExportSnapshot) {
  const windowRef = window.open("", "_blank");
  if (!windowRef) return;
  windowRef.document.write(buildDashboardExportHtml(snapshot));
  windowRef.document.close();
  windowRef.addEventListener("load", () => windowRef.print(), { once: true });
}
