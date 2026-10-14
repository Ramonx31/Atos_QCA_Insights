import "server-only";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import { parseFirstActsTable, type PdfTextEntry } from "@/server/uploads/pdf-table-parser";
import type { ExtractionProvider, PreparedScreenshot } from "@/server/uploads/extraction-provider";

export { parseFirstActsTable } from "@/server/uploads/pdf-table-parser";

/** Leitura local da camada textual de PDFs exportados pelo painel operacional. */
export class PdfExtractionProvider implements ExtractionProvider {
  async extract(input: PreparedScreenshot): Promise<unknown> {
    if (input.mimeType !== "application/pdf") throw new Error("O extrator de PDF recebeu um tipo de arquivo inválido.");
    const document = await pdfjs.getDocument({ data: input.bytes }).promise;
    const page = await document.getPage(1);
    const content = await page.getTextContent();
    const entries: PdfTextEntry[] = content.items.flatMap((item) => "str" in item && "transform" in item ? [{ text: item.str.trim(), x: item.transform[4], y: item.transform[5] }] : []);
    return parseFirstActsTable(entries);
  }
}
