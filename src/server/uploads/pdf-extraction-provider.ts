import "server-only";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import type { ExtractionProvider, PreparedScreenshot } from "@/server/uploads/extraction-provider";

type TextEntry = { text: string; x: number; y: number };
type PdfRow = { y: number; act: string[]; manual?: string; automated?: string; total?: string };

const numberPattern = /^\d{1,3}(?:\.\d{3})*(?:,\d+)?$|^\d+(?:,\d+)?$/;
const toNumber = (value: string) => Number(value.replace(/\./g, "").replace(",", "."));

function columnOf(x: number): "act" | "manual" | "automated" | "total" | null {
  if (x < 1_000) return "act";
  if (x < 1_200) return "manual";
  if (x < 1_450) return "automated";
  if (x < 1_580) return "total";
  return null;
}

function parseFirstActsTable(entries: TextEntry[]) {
  const start = entries.findIndex((entry) => entry.text === "Ato");
  const end = entries.findIndex((entry, index) => index > start && entry.text.startsWith("Detalhamento dos Atos por Centro de Custo"));
  if (start < 0 || end < 0) throw new Error("Tabela de detalhamento dos atos não encontrada no PDF.");
  const rows: PdfRow[] = [];
  for (const entry of entries.slice(start + 1, end)) {
    if (!entry.text.trim() || entry.text.includes("%") || /^(Atos Manuais|Atos Automatizados|Total)$/i.test(entry.text)) continue;
    const column = columnOf(entry.x);
    if (!column) continue;
    let row = rows.find((candidate) => Math.abs(candidate.y - entry.y) < 2);
    if (!row) { row = { y: entry.y, act: [] }; rows.push(row); }
    if (column === "act") row.act.push(entry.text);
    else if (numberPattern.test(entry.text)) row[column] = entry.text;
  }
  const acts = rows
    .sort((a, b) => b.y - a.y)
    .filter((row) => row.act.join(" ").trim() && !/^total$/i.test(row.act.join(" ").trim()))
    .map((row) => ({
      act: row.act.join(" ").trim(),
      manual: row.manual ?? "0",
      automated: row.automated ?? "0",
      total: row.total ?? String(toNumber(row.manual ?? "0") + toNumber(row.automated ?? "0")),
    }));
  if (!acts.length) throw new Error("Nenhum ato foi identificado na tabela do PDF.");
  const total = acts.reduce((sum, act) => ({ manual: sum.manual + toNumber(act.manual), automated: sum.automated + toNumber(act.automated), total: sum.total + toNumber(act.total) }), { manual: 0, automated: 0, total: 0 });
  return { acts, total: { act: "Total calculado", ...total } };
}

/** Leitura local da camada textual de PDFs exportados pelo painel operacional. */
export class PdfExtractionProvider implements ExtractionProvider {
  async extract(input: PreparedScreenshot): Promise<unknown> {
    if (input.mimeType !== "application/pdf") throw new Error("O extrator de PDF recebeu um tipo de arquivo inválido.");
    const document = await pdfjs.getDocument({ data: input.bytes }).promise;
    const page = await document.getPage(1);
    const content = await page.getTextContent();
    const entries = content.items.flatMap((item) => "str" in item && "transform" in item ? [{ text: item.str.trim(), x: item.transform[4], y: item.transform[5] }] : []);
    return parseFirstActsTable(entries);
  }
}
