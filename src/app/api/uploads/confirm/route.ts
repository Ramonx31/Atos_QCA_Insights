import { createScreenshotService, readScreenshotFile, respondSafely } from "@/server/uploads/create-screenshot-service";
import { invalidUpload } from "@/server/security/errors";

export const runtime = "nodejs";

function parseJsonField(form: FormData, name: string): unknown {
  const value = form.get(name);
  if (typeof value !== "string") throw invalidUpload();
  try { return JSON.parse(value); } catch { throw invalidUpload(); }
}

export function POST(request: Request) {
  return respondSafely(async () => {
    const form = await request.formData();
    return createScreenshotService().confirm(await readScreenshotFile(form), parseJsonField(form, "metadata"), parseJsonField(form, "acts"));
  });
}
