import "server-only";
import type { ObjectStorage } from "@/server/storage/object-storage";
import { storedUploadSchema, type StoredUpload } from "@/server/results/stored-upload";
import type { ScreenshotFile } from "@/server/uploads/schemas";

const RESULTS_PREFIX = "results/";
const SCREENSHOTS_PREFIX = "screenshots/";
const EXTENSION_BY_MIME_TYPE: Record<ScreenshotFile["mimeType"], string> = { "application/pdf": "pdf" };

const resultPath = (fileHash: string) => `${RESULTS_PREFIX}${fileHash}.json`;

/** Persiste uploads confirmados como um arquivo imutável por screenshot (sem leitura-modificação-gravação). */
export class ResultStore {
  constructor(private readonly storage: ObjectStorage) {}

  hasUpload(fileHash: string): Promise<boolean> {
    return this.storage.exists(resultPath(fileHash));
  }

  /** Grava a imagem e, por último, o registro: o registro é o marcador de conclusão. */
  async saveUpload(upload: Omit<StoredUpload, "screenshotPath">, screenshot: Pick<ScreenshotFile, "bytes" | "mimeType">): Promise<void> {
    const screenshotPath = `${SCREENSHOTS_PREFIX}${upload.id}.${EXTENSION_BY_MIME_TYPE[screenshot.mimeType]}`;
    if (!(await this.storage.exists(screenshotPath))) await this.storage.put(screenshotPath, screenshot.bytes, screenshot.mimeType);
    const record = storedUploadSchema.parse({ ...upload, screenshotPath });
    await this.storage.put(resultPath(upload.id), new TextEncoder().encode(JSON.stringify(record)), "application/json");
  }

  async listUploads(): Promise<StoredUpload[]> {
    const files = await this.storage.readAll(RESULTS_PREFIX);
    return files.map((bytes) => storedUploadSchema.parse(JSON.parse(new TextDecoder().decode(bytes))));
  }
}
