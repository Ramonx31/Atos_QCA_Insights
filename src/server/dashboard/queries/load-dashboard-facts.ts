import "server-only";
import type { DashboardFact } from "@/server/dashboard/types";
import { buildDashboardFacts } from "@/server/results/build-facts";
import { createResultStore } from "@/server/results/create-result-store";

/** Lê todos os uploads confirmados; sem nenhum upload, o painel mostra o estado vazio. */
export async function loadDashboardFacts(): Promise<DashboardFact[]> {
  return buildDashboardFacts(await createResultStore().listUploads());
}
