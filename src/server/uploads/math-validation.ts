import type { ExtractedAct, ExtractionPayload } from "@/server/uploads/schemas";
import type { ValidationIssue } from "@/server/uploads/extraction-provider";

const PERCENTAGE_TOLERANCE = 0.01;
const equals = (left: number, right: number, tolerance = 0) => Math.abs(left - right) <= tolerance;
const percentage = (value: number, total: number) => total === 0 ? 0 : (value / total) * 100;

function validateRow(row: ExtractedAct, scope: "act" | "total"): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const expectedTotal = row.manual + row.automated;
  const identity = { scope, ...(scope === "act" ? { act: row.act } : {}) } as const;
  if (!equals(expectedTotal, row.total)) issues.push({ ...identity, code: "total_mismatch", expected: expectedTotal, extracted: row.total });
  const expectedManualPercentage = percentage(row.manual, expectedTotal);
  if (row.manualPercentage !== undefined && !equals(expectedManualPercentage, row.manualPercentage, PERCENTAGE_TOLERANCE)) issues.push({ ...identity, code: "manual_percentage_mismatch", expected: expectedManualPercentage, extracted: row.manualPercentage });
  const expectedAutomatedPercentage = percentage(row.automated, expectedTotal);
  if (row.automatedPercentage !== undefined && !equals(expectedAutomatedPercentage, row.automatedPercentage, PERCENTAGE_TOLERANCE)) issues.push({ ...identity, code: "automated_percentage_mismatch", expected: expectedAutomatedPercentage, extracted: row.automatedPercentage });
  return issues;
}

export function validateExtractionMath(payload: ExtractionPayload): ValidationIssue[] {
  const issues = [...payload.acts.flatMap((act) => validateRow(act, "act")), ...validateRow(payload.total, "total")];
  const sums = payload.acts.reduce((accumulator, act) => ({ manual: accumulator.manual + act.manual, automated: accumulator.automated + act.automated, total: accumulator.total + act.total }), { manual: 0, automated: 0, total: 0 });
  for (const field of ["manual", "automated", "total"] as const) {
    if (!equals(sums[field], payload.total[field])) issues.push({ code: "acts_sum_mismatch", scope: "total", field, expected: sums[field], extracted: payload.total[field] });
  }
  return issues;
}
