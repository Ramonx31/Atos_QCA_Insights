import { createScreenshotService, readScreenshotFile, respondSafely } from "@/server/uploads/create-screenshot-service";

export const runtime = "nodejs";
export const maxDuration = 60;

export function POST(request: Request) {
  return respondSafely(async () => createScreenshotService().createPreview(await readScreenshotFile(await request.formData())));
}
