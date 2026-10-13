import { createHash } from "node:crypto";
import type { ExtractionProvider, ScreenshotPreprocessor, ValidationIssue } from "@/server/uploads/extraction-provider";
import { NoopScreenshotPreprocessor } from "@/server/uploads/extraction-provider";
import { validateExtractionMath } from "@/server/uploads/math-validation";
import { confirmedActsSchema, extractionPayloadSchema, screenshotFileSchema, uploadMetadataSchema, type ExtractionPayload, type ScreenshotFile } from "@/server/uploads/schemas";
import type { StoredUpload } from "@/server/results/stored-upload";
import { duplicateUpload, invalidUpload, processingFailed } from "@/server/security/errors";

export interface ExtractionPreview { fileHash: string; extraction: ExtractionPayload; validationIssues: ValidationIssue[]; }

/** Subconjunto do ResultStore usado pelo serviço (facilita testes). */
export interface UploadResultStore {
  hasUpload(fileHash: string): Promise<boolean>;
  saveUpload(upload: Omit<StoredUpload, "screenshotPath">, screenshot: Pick<ScreenshotFile, "bytes" | "mimeType">): Promise<void>;
}

const hashOf = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");

function parseFile(input: ScreenshotFile): ScreenshotFile {
  try { return screenshotFileSchema.parse(input); } catch { throw invalidUpload(); }
}

/**
 * Fluxo sem estado (compatível com serverless): o preview só lê o screenshot; a
 * confirmação recebe o arquivo novamente com os valores revisados e só então persiste.
 */
export class ScreenshotExtractionService {
  constructor(
    private readonly store: UploadResultStore,
    private readonly extractionProvider: ExtractionProvider,
    private readonly preprocessor: ScreenshotPreprocessor = new NoopScreenshotPreprocessor(),
    private readonly now: () => Date = () => new Date(),
  ) {}

  async createPreview(input: ScreenshotFile): Promise<ExtractionPreview> {
    const file = parseFile(input);
    const fileHash = hashOf(file.bytes);
    if (await this.store.hasUpload(fileHash)) throw duplicateUpload();
    try {
      const prepared = await this.preprocessor.process({ bytes: file.bytes, mimeType: file.mimeType });
      const extraction = extractionPayloadSchema.parse(await this.extractionProvider.extract(prepared));
      return { fileHash, extraction, validationIssues: validateExtractionMath(extraction) };
    } catch { throw processingFailed(); }
  }

  async confirm(input: ScreenshotFile, metadata: unknown, acts: unknown): Promise<{ fileHash: string }> {
    const file = parseFile(input);
    let parsedMetadata: ReturnType<typeof uploadMetadataSchema.parse>;
    let parsedActs: ReturnType<typeof confirmedActsSchema.parse>;
    try { parsedMetadata = uploadMetadataSchema.parse(metadata); parsedActs = confirmedActsSchema.parse(acts); } catch { throw invalidUpload(); }
    const fileHash = hashOf(file.bytes);
    if (await this.store.hasUpload(fileHash)) throw duplicateUpload();
    await this.store.saveUpload({ id: fileHash, uploadedAt: this.now().toISOString(), originalFilename: file.originalFilename, ...parsedMetadata, acts: parsedActs }, file);
    return { fileHash };
  }
}
