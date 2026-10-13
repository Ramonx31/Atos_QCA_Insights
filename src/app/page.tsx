import { AppShell } from "@/components/layout/app-shell";
import { ActsDashboard } from "@/components/dashboard/acts-dashboard";
import { ScreenshotUpload } from "@/components/upload/screenshot-upload";
import { loadDashboardFacts } from "@/server/dashboard/queries/load-dashboard-facts";

/** Os dados mudam a cada upload confirmado; a página não pode ser pré-renderizada no build. */
export const dynamic = "force-dynamic";

export default async function Home() {
  const facts = await loadDashboardFacts();
  return <AppShell><div className="space-y-6"><ScreenshotUpload /><ActsDashboard facts={facts} /></div></AppShell>;
}
