import { normalizeActName } from "@/server/acts/act-name-normalizer";
import type { DashboardFact } from "@/server/dashboard/types";
import type { StoredUpload } from "@/server/results/stored-upload";

const toList = (value: string | null) => (value ? [value] : []);
const uploadCells = (upload: StoredUpload) => upload.cells.length ? upload.cells : toList(upload.cell);
const uploadScope = (upload: StoredUpload) => [upload.competence, upload.directorate, upload.costCenter, ...uploadCells(upload), upload.manager].join("\u0001");

/** Um PDF representa a fotografia completa da competência/contexto; a versão mais nova substitui a anterior no painel. */
function latestUploadsByScope(uploads: StoredUpload[]) {
  const latest = new Map<string, StoredUpload>();
  for (const upload of [...uploads].sort((left, right) => left.uploadedAt.localeCompare(right.uploadedAt) || left.id.localeCompare(right.id))) latest.set(uploadScope(upload), upload);
  return [...latest.values()].sort((left, right) => left.uploadedAt.localeCompare(right.uploadedAt) || left.id.localeCompare(right.id));
}

/**
 * Converte uploads confirmados em fatos do dashboard. Nomes de atos equivalentes
 * (acentos, caixa, espaços) usam o nome da versão vigente. Para o mesmo contexto,
 * somente o PDF confirmado mais recentemente entra na consolidação.
 */
export function buildDashboardFacts(uploads: StoredUpload[]): DashboardFact[] {
  const canonicalNames = new Map<string, string>();
  const ordered = latestUploadsByScope(uploads);
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
      cells: uploadCells(upload),
      directorates: toList(upload.directorate),
      managers: toList(upload.manager),
    };
  }));
}
