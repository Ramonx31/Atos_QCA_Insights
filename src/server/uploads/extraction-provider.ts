import type { ScreenshotFile } from "@/server/uploads/schemas";

export interface PreparedScreenshot {
  bytes: Uint8Array;
  mimeType: ScreenshotFile["mimeType"];
}

/** Porta para OCR/IA: fornecedores devem retornar dados compatíveis com extractionPayloadSchema. */
export interface ExtractionProvider {
  extract(input: PreparedScreenshot): Promise<unknown>;
}

export interface ScreenshotPreprocessor {
  process(input: PreparedScreenshot): Promise<PreparedScreenshot>;
}

export class NoopScreenshotPreprocessor implements ScreenshotPreprocessor {
  process(input: PreparedScreenshot) { return Promise.resolve(input); }
}

export type ValidationIssue = {
  code: "total_mismatch" | "manual_percentage_mismatch" | "automated_percentage_mismatch" | "acts_sum_mismatch";
  scope: "act" | "total";
  act?: string;
  field?: "manual" | "automated" | "total";
  expected: number;
  extracted: number;
};
