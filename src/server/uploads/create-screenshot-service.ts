import "server-only";
import { createResultStore } from "@/server/results/create-result-store";
import { ClaudeExtractionProvider } from "@/server/uploads/claude-extraction-provider";
import { ScreenshotExtractionService } from "@/server/uploads/services/screenshot-extraction-service";
import { SafeApplicationError, invalidUpload, toSafeError } from "@/server/security/errors";
import type { ScreenshotFile } from "@/server/uploads/schemas";

export function createScreenshotService(): ScreenshotExtractionService {
  return new ScreenshotExtractionService(createResultStore(), new ClaudeExtractionProvider());
}

/** Lê o campo "file" do multipart e converte para o formato validado pelo serviço. */
export async function readScreenshotFile(form: FormData): Promise<ScreenshotFile> {
  const file = form.get("file");
  if (!(file instanceof File)) throw invalidUpload();
  return { originalFilename: file.name, mimeType: file.type as ScreenshotFile["mimeType"], bytes: new Uint8Array(await file.arrayBuffer()) };
}

/** Executa o handler e devolve apenas mensagens seguras ao cliente. */
export async function respondSafely(handler: () => Promise<unknown>): Promise<Response> {
  try { return Response.json(await handler()); }
  catch (error) {
    const safe = toSafeError(error);
    if (!(error instanceof SafeApplicationError)) console.error("Falha inesperada no upload:", error);
    return Response.json({ error: safe.publicMessage }, { status: safe.statusCode });
  }
}
