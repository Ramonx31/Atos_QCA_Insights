import { calculateActMetrics } from "@/lib/acts";
import type { ActRecord, CalculatedActRecord } from "@/types/acts";

const records: ActRecord[] = [
  { id: "ato-001", competence: "2026-09", actName: "Distribuição", manual: 128, automated: 372, extractedManualPercentage: 26, extractedAutomatedPercentage: 74, costCenter: "Contencioso", cell: "Cível Estratégico", manager: "Ana Souza", directorate: "Jurídico" },
  { id: "ato-002", competence: "2026-09", actName: "Publicação", manual: 94, automated: 406, extractedManualPercentage: 19, extractedAutomatedPercentage: 81, costCenter: "Contencioso", cell: "Cível Estratégico", manager: "Ana Souza", directorate: "Jurídico" },
  { id: "ato-003", competence: "2026-09", actName: "Protocolo", manual: 215, automated: 185, extractedManualPercentage: 54, extractedAutomatedPercentage: 46, costCenter: "Consultivo", cell: "Operações", manager: "Bruno Lima", directorate: "Jurídico" },
];

export const mockActRecords: CalculatedActRecord[] = records.map(calculateActMetrics);
