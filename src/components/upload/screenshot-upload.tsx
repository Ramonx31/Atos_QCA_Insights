"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { isNonAutomatedAct } from "@/lib/non-automated-acts";
import type { ValidationIssue } from "@/server/uploads/extraction-provider";

interface ReviewRow { act: string; manual: number; automated: number; }
interface PreviewResponse { extraction: { acts: ReviewRow[] }; validationIssues: ValidationIssue[]; error?: string; }
type Step = "idle" | "reading" | "review" | "saving";

const ISSUE_LABELS: Record<ValidationIssue["code"], string> = {
  total_mismatch: "total diferente de manual + automatizado",
  manual_percentage_mismatch: "% manual diferente do calculado",
  automated_percentage_mismatch: "% automatizado diferente do calculado",
  acts_sum_mismatch: "soma dos atos diferente do total do print",
};
const METADATA_FIELDS = [["directorate", "Diretoria"], ["costCenter", "Centro de custo"], ["cell", "Célula"], ["manager", "Gestor"]] as const;
const inputClass = "w-full rounded-md border bg-white px-3 py-2 text-sm";
const currentCompetence = () => new Date().toISOString().slice(0, 7);

async function postForm<T>(url: string, body: FormData): Promise<T & { error?: string }> {
  const response = await fetch(url, { method: "POST", body });
  const data = await response.json().catch(() => ({ error: "Resposta inválida do servidor." }));
  return response.ok ? data : { error: data.error ?? "Não foi possível concluir a solicitação." } as T & { error: string };
}

/** Envia o screenshot, mostra os valores lidos para revisão humana e só salva após confirmação. */
export function ScreenshotUpload() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [competence, setCompetence] = useState(currentCompetence);
  const [labels, setLabels] = useState<Record<string, string>>({});
  const [rows, setRows] = useState<ReviewRow[]>([]);
  const [issues, setIssues] = useState<ValidationIssue[]>([]);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const reset = () => { setStep("idle"); setFile(null); setRows([]); setIssues([]); };
  const updateRow = (index: number, field: "act" | "manual" | "automated", value: string) => setRows((current) => current.map((row, position) => position === index ? { ...row, [field]: field === "act" ? value : Math.max(0, Math.trunc(Number(value) || 0)) } : row));

  async function readScreenshot(event: FormEvent) {
    event.preventDefault();
    if (!file) return;
    setStep("reading"); setMessage(null);
    const body = new FormData();
    body.set("file", file);
    const result = await postForm<PreviewResponse>("/api/uploads/preview", body);
    if (result.error || !result.extraction) { setMessage({ type: "error", text: result.error ?? "Não foi possível ler o screenshot." }); setStep("idle"); return; }
    setRows(result.extraction.acts.map(({ act, manual, automated }) => ({ act, manual, automated })));
    setIssues(result.validationIssues);
    setStep("review");
  }

  async function confirm() {
    if (!file) return;
    setStep("saving"); setMessage(null);
    const body = new FormData();
    body.set("file", file);
    body.set("metadata", JSON.stringify({ competence, ...labels }));
    body.set("acts", JSON.stringify(rows));
    const result = await postForm<{ fileHash: string }>("/api/uploads/confirm", body);
    if (result.error) { setMessage({ type: "error", text: result.error }); setStep("review"); return; }
    reset();
    setMessage({ type: "success", text: "Dados salvos. O painel foi atualizado." });
    router.refresh();
  }

  const busy = step === "reading" || step === "saving";
  return <Card className="p-5"><h3 className="font-semibold">Enviar PDF</h3><p className="mb-4 text-sm text-muted-foreground">Envie o PDF exportado pelo painel. A tabela de atos é lida diretamente do arquivo; você revisa os valores antes de salvar. Um novo PDF para a mesma competência e contexto substitui a versão anterior no dashboard.</p>
    <form onSubmit={readScreenshot} className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
      <label className="text-sm xl:col-span-2">Relatório em PDF (até 10 MB)<input type="file" accept="application/pdf,.pdf" disabled={step !== "idle"} onChange={(event) => setFile(event.target.files?.[0] ?? null)} className={`${inputClass} mt-1`} /></label>
      <label className="text-sm">Competência<input type="month" required value={competence} disabled={step !== "idle"} onChange={(event) => setCompetence(event.target.value)} className={`${inputClass} mt-1`} /></label>
      {METADATA_FIELDS.map(([key, label]) => <label key={key} className="text-sm">{label} (opcional)<input type="text" maxLength={150} value={labels[key] ?? ""} disabled={step !== "idle"} onChange={(event) => setLabels((current) => ({ ...current, [key]: event.target.value }))} className={`${inputClass} mt-1`} /></label>)}
      {step === "idle" || step === "reading" ? <button type="submit" disabled={!file || busy} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50 md:col-span-2 xl:col-span-6 xl:justify-self-start">{step === "reading" ? "Lendo PDF…" : "Ler PDF"}</button> : null}
    </form>
    {message ? <p role="status" className={`mt-4 text-sm ${message.type === "error" ? "text-red-700" : "text-green-700"}`}>{message.text}</p> : null}
    {step === "review" || step === "saving" ? <div className="mt-5 space-y-4">
      {issues.length > 0 ? <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm"><p className="font-medium">Divergências encontradas na leitura — confira com o print:</p><ul className="list-disc pl-5">{issues.map((issue, index) => <li key={index}>{issue.scope === "act" ? issue.act : "Total"}: {ISSUE_LABELS[issue.code]} (esperado {issue.expected.toLocaleString("pt-BR")}, lido {issue.extracted.toLocaleString("pt-BR")})</li>)}</ul></div> : null}
      <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left text-muted-foreground"><th className="py-2 pr-3">Ato</th><th className="px-3">Manual</th><th className="px-3">Automatizado</th><th className="px-3">Total</th></tr></thead><tbody>{rows.map((row, index) => <tr key={index} className={`border-b ${isNonAutomatedAct(row.act) ? "bg-red-50" : ""}`}><td className="py-2 pr-3"><div className="flex min-w-56 flex-wrap items-center gap-2"><input type="text" value={row.act} disabled={busy} onChange={(event) => updateRow(index, "act", event.target.value)} className={inputClass} />{isNonAutomatedAct(row.act) ? <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">Sem automação</span> : null}</div></td><td className="px-3"><input type="number" min={0} value={row.manual} disabled={busy} onChange={(event) => updateRow(index, "manual", event.target.value)} className={`${inputClass} w-28`} /></td><td className="px-3"><input type="number" min={0} value={row.automated} disabled={busy} onChange={(event) => updateRow(index, "automated", event.target.value)} className={`${inputClass} w-28`} /></td><td className="px-3 tabular-nums">{(row.manual + row.automated).toLocaleString("pt-BR")}</td></tr>)}</tbody></table></div>
      <div className="flex gap-3"><button type="button" onClick={confirm} disabled={busy} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">{step === "saving" ? "Salvando…" : "Confirmar e salvar"}</button><button type="button" onClick={reset} disabled={busy} className="rounded-md border px-4 py-2 text-sm disabled:opacity-50">Cancelar</button></div>
    </div> : null}
  </Card>;
}
