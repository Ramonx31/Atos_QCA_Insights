"use client";

import { downloadDashboardHtml, printDashboardPdf, type DashboardExportSnapshot } from "@/components/dashboard/export/dashboard-export";

export function DashboardExportButtons({ snapshot }: { snapshot: DashboardExportSnapshot }) {
  return <div className="flex gap-2"><button type="button" onClick={() => downloadDashboardHtml(snapshot)} className="rounded-lg border bg-white px-3 py-2 text-sm font-medium">Exportar HTML</button><button type="button" onClick={() => printDashboardPdf(snapshot)} className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground">Exportar PDF</button></div>;
}
