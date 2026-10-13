import "server-only";
import type { ExtractionProvider, PreparedScreenshot } from "@/server/uploads/extraction-provider";

const API_URL = "https://api.anthropic.com/v1/messages";
const API_VERSION = "2023-06-01";
const DEFAULT_MODEL = "claude-sonnet-5-5";
const MAX_OUTPUT_TOKENS = 4096;
const REQUEST_TIMEOUT_MS = 50_000;
const TOOL_NAME = "registrar_tabela_de_atos";

const rowProperties = {
  act: { type: "string", description: "Nome do ato exatamente como aparece no print." },
  manual: { type: "string", description: "Quantidade manual, exatamente como exibida (ex.: \"6.338\")." },
  automated: { type: "string", description: "Quantidade automatizada, exatamente como exibida." },
  total: { type: "string", description: "Total do ato, exatamente como exibido." },
  manualPercentage: { type: "string", description: "Percentual manual exibido, se houver (ex.: \"78,44%\")." },
  automatedPercentage: { type: "string", description: "Percentual automatizado exibido, se houver." },
  totalPercentage: { type: "string", description: "Percentual total exibido, se houver." },
};
const rowSchema = { type: "object", properties: rowProperties, required: ["act", "manual", "automated", "total"] };

const TOOL = {
  name: TOOL_NAME,
  description: "Registra a tabela de atos manuais e automatizados lida do screenshot.",
  input_schema: { type: "object", properties: { acts: { type: "array", items: rowSchema, description: "Uma linha por ato, sem a linha de total." }, total: rowSchema }, required: ["acts", "total"] },
};

const INSTRUCTIONS = "Leia a tabela de atos do screenshot de um dashboard (colunas manual, automatizado, total e percentuais). Transcreva os números exatamente como aparecem, sem calcular, corrigir ou inferir valores. Se um percentual não estiver visível, omita o campo. Use a linha de total do print em 'total'.";

interface ClaudeResponse { content?: { type: string; name?: string; input?: unknown }[]; }

/** OCR por visão computacional via API do Claude; a chave vem de ANTHROPIC_API_KEY. */
export class ClaudeExtractionProvider implements ExtractionProvider {
  async extract(input: PreparedScreenshot): Promise<unknown> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY não configurada.");
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": API_VERSION },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL ?? DEFAULT_MODEL,
        max_tokens: MAX_OUTPUT_TOKENS,
        tools: [TOOL],
        tool_choice: { type: "tool", name: TOOL_NAME },
        messages: [{ role: "user", content: [
          { type: "image", source: { type: "base64", media_type: input.mimeType, data: Buffer.from(input.bytes).toString("base64") } },
          { type: "text", text: INSTRUCTIONS },
        ] }],
      }),
    });
    if (!response.ok) throw new Error(`Falha na extração (HTTP ${response.status}).`);
    const toolUse = ((await response.json()) as ClaudeResponse).content?.find((block) => block.type === "tool_use" && block.name === TOOL_NAME);
    if (!toolUse) throw new Error("Resposta da extração sem tabela estruturada.");
    return toolUse.input;
  }
}
