import { normalizeActName } from "@/server/acts/act-name-normalizer";
import type { DashboardFact } from "@/server/dashboard/types";
import type { StoredUpload } from "@/server/results/stored-upload";

const toList = (value: string | null) => (value ? [value] : []);

/**
 * Converte uploads confirmados em fatos do dashboard. Nomes de atos equivalentes
 * (acentos, caixa, espaços) usam o nome do primeiro upload, em ordem cronológica.
 */
export function buildDashboardFacts(uploads: StoredUpload[]): DashboardFact[] {
  const canonicalNames = new Map<string, string>();
  const ordered = [...uploads].sort((left, right) => left.uploadedAt.localeCompare(right.uploadedAt));
  return ordered.flatMap((upload) => upload.acts.map((item, index): DashboardFact => {
    const key = normalizeActName(item.act);
    if (!canonicalNames.has(key)) canonicalNames.set(key, item.act);
    return {
      id: `${upload.id}:${index}`,
      competence: upload.competence,
      actName: canonicalNames.get(key) ?? item.act,
      manual: item.manual,
      automated: item.automated,
      costCenter: upload.costCenter,
      cells: toList(upload.cell),
      directorates: toList(upload.directorate),
      managers: toList(upload.manager),
    };
  }));
}
