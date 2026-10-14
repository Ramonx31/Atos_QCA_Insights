export type PdfTextEntry = { text: string; x: number; y: number };

type PdfRow = { y: number; act: string[]; manual?: string; automated?: string; total?: string };
type PdfColumn = "act" | "manual" | "automated" | "total";

const numberPattern = /^\d{1,3}(?:\.\d{3})*(?:,\d+)?$|^\d+(?:,\d+)?$/;
const toNumber = (value: string) => Number(value.replace(/\./g, "").replace(",", "."));

function findTableColumns(entries: PdfTextEntry[], start: number): Record<PdfColumn, number> {
  const headerY = entries[start].y;
  const headerEntries = entries.slice(start, start + 10).filter((entry) => Math.abs(entry.y - headerY) < 2);
  const findHeader = (name: string) => headerEntries.find((entry) => entry.text === name)?.x;
  const columns = { act: findHeader("Ato"), manual: findHeader("Atos Manuais"), automated: findHeader("Atos Automatizados"), total: findHeader("Total") };
  if (Object.values(columns).some((value) => value === undefined)) throw new Error("Cabeçalho da tabela de atos inválido no PDF.");
  return columns as Record<PdfColumn, number>;
}

function columnOf(x: number, columns: Record<PdfColumn, number>): PdfColumn {
  return (Object.entries(columns) as [PdfColumn, number][]).reduce((nearest, current) => Math.abs(current[1] - x) < Math.abs(nearest[1] - x) ? current : nearest)[0];
}

/** Extrai a primeira tabela "Detalhamento dos Atos" usando os cabeçalhos como referência de posição. */
export function parseFirstActsTable(entries: PdfTextEntry[]) {
  const start = entries.findIndex((entry) => entry.text === "Ato");
  const end = entries.findIndex((entry, index) => index > start && entry.text.startsWith("Detalhamento dos Atos por Centro de Custo"));
  if (start < 0 || end < 0) throw new Error("Tabela de detalhamento dos atos não encontrada no PDF.");
  const columns = findTableColumns(entries, start);
  const rows: PdfRow[] = [];
  for (const entry of entries.slice(start + 1, end)) {
    if (!entry.text.trim() || entry.text.includes("%") || /^(Atos Manuais|Atos Automatizados|Total)$/i.test(entry.text)) continue;
    const column = columnOf(entry.x, columns);
    let row = rows.find((candidate) => Math.abs(candidate.y - entry.y) < 2);
    if (!row) { row = { y: entry.y, act: [] }; rows.push(row); }
    if (column === "act") row.act.push(entry.text);
    else if (numberPattern.test(entry.text)) row[column] = entry.text;
  }
  const acts = rows
    .sort((a, b) => b.y - a.y)
    .filter((row) => row.act.join(" ").trim() && !/^total$/i.test(row.act.join(" ").trim()))
    .map((row) => ({ act: row.act.join(" ").trim(), manual: row.manual ?? "0", automated: row.automated ?? "0", total: row.total ?? String(toNumber(row.manual ?? "0") + toNumber(row.automated ?? "0")) }));
  if (!acts.length) throw new Error("Nenhum ato foi identificado na tabela do PDF.");
  const total = acts.reduce((sum, act) => ({ manual: sum.manual + toNumber(act.manual), automated: sum.automated + toNumber(act.automated), total: sum.total + toNumber(act.total) }), { manual: 0, automated: 0, total: 0 });
  return { acts, total: { act: "Total calculado", ...total } };
}
