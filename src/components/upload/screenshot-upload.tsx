"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { ACTIVE_CELLS_BY_COST_CENTER, ACTIVE_ORGANIZATION_OPTIONS } from "@/data/active-organization-options";
import { isNonAutomatedAct } from "@/lib/non-automated-acts";
import type { ValidationIssue } from "@/server/uploads/extraction-provider";

type ReviewRow = { act: string; manual: number; automated: number };
type PreviewResponse = { extraction: { acts: ReviewRow[] }; validationIssues: ValidationIssue[]; error?: string };
type Step = "idle" | "reading" | "review" | "saving";
const fields = [{ key: "directorate", label: "Diretoria" }, { key: "costCenter", label: "Centro de custo" }, { key: "manager", label: "Gestor" }] as const;
const inputClass = "w-full rounded-md border bg-white px-3 py-2 text-sm";
const currentCompetence = () => new Date().toISOString().slice(0, 7);

async function postForm<T>(url: string, body: FormData): Promise<T & { error?: string }> {
  const response = await fetch(url, { method: "POST", body });
  const data = await response.json().catch(() => ({ error: "Resposta inválida do servidor." }));
  return response.ok ? data : { error: data.error ?? "Não foi possível concluir a solicitação." } as T & { error: string };
}

export function ScreenshotUpload() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [competence, setCompetence] = useState(currentCompetence);
  const [labels, setLabels] = useState<Record<string, string>>({});
  const [selectedCells, setSelectedCells] = useState<string[]>([]);
  const [rows, setRows] = useState<ReviewRow[]>([]);
  const [issues, setIssues] = useState<ValidationIssue[]>([]);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const busy = step === "reading" || step === "saving";
  const cellOptions = labels.costCenter ? ACTIVE_CELLS_BY_COST_CENTER[labels.costCenter] ?? [] : [];
  const reset = () => { setStep("idle"); setFile(null); setRows([]); setIssues([]); setSelectedCells([]); };
  const toggleCell = (cell: string) => setSelectedCells((current) => current.includes(cell) ? current.filter((value) => value !== cell) : [...current, cell]);
  const updateLabel = (key: string, value: string) => { setLabels((current) => ({ ...current, [key]: value })); if (key === "costCenter") setSelectedCells([]); };
  const updateRow = (index: number, field: keyof ReviewRow, value: string) => setRows((current) => current.map((row, position) => position === index ? { ...row, [field]: field === "act" ? value : Math.max(0, Math.trunc(Number(value) || 0)) } : row));

  async function readPdf(event: FormEvent) {
    event.preventDefault(); if (!file) return;
    setStep("reading"); setMessage(null); const body = new FormData(); body.set("file", file);
    const result = await postForm<PreviewResponse>("/api/uploads/preview", body);
    if (result.error || !result.extraction) { setMessage({ type: "error", text: result.error ?? "Não foi possível ler o PDF." }); setStep("idle"); return; }
    setRows(result.extraction.acts); setIssues(result.validationIssues); setStep("review");
  }
  async function confirm() {
    if (!file) return; setStep("saving"); setMessage(null); const body = new FormData(); body.set("file", file); body.set("metadata", JSON.stringify({ competence, ...labels, cells: selectedCells })); body.set("acts", JSON.stringify(rows));
    const result = await postForm<{ fileHash: string }>("/api/uploads/confirm", body);
    if (result.error) { setMessage({ type: "error", text: result.error }); setStep("review"); return; }
    reset(); setMessage({ type: "success", text: "Dados salvos. O painel foi atualizado." }); router.refresh();
  }

  return <Card className="p-5"><h3 className="font-semibold">Enviar PDF</h3><p className="mb-4 text-sm text-muted-foreground">Envie o PDF exportado pelo painel e revise os valores antes de salvar.</p>
    <form onSubmit={readPdf} className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
      <label className="text-sm xl:col-span-2">Relatório em PDF (até 10 MB)<input type="file" accept="application/pdf,.pdf" disabled={step !== "idle"} onChange={(event) => setFile(event.target.files?.[0] ?? null)} className={`${inputClass} mt-1`} /></label>
      <label className="text-sm">Competência<input type="month" required value={competence} disabled={step !== "idle"} onChange={(event) => setCompetence(event.target.value)} className={`${inputClass} mt-1`} /></label>
      {fields.map(({ key, label }) => <label key={key} className="text-sm">{label} (opcional)<select value={labels[key] ?? ""} disabled={step !== "idle"} onChange={(event) => updateLabel(key, event.target.value)} className={`${inputClass} mt-1`}><option value="">Selecionar...</option>{ACTIVE_ORGANIZATION_OPTIONS[key].map((option) => <option key={option} value={option}>{option}</option>)}</select></label>)}
      <fieldset className="text-sm xl:col-span-2"><legend>Células (opcional)</legend><div className="mt-1 max-h-40 space-y-1 overflow-y-auto rounded-md border bg-white p-2">{cellOptions.map((option) => <label key={option} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 hover:bg-slate-50"><input type="checkbox" checked={selectedCells.includes(option)} disabled={step !== "idle"} onChange={() => toggleCell(option)} /><span>{option}</span></label>)}{!labels.costCenter ? <p className="px-2 py-1 text-muted-foreground">Selecione primeiro o centro de custo.</p> : null}</div><span className="mt-1 block text-xs text-muted-foreground">{selectedCells.length ? `${selectedCells.length} célula${selectedCells.length > 1 ? "s" : ""} selecionada${selectedCells.length > 1 ? "s" : ""}.` : "Clique nas células que deseja associar ao relatório."}</span></fieldset>
      {step === "idle" || step === "reading" ? <button type="submit" disabled={!file || busy} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50 md:col-span-2 xl:col-span-6 xl:justify-self-start">{step === "reading" ? "Lendo PDF…" : "Ler PDF"}</button> : null}
    </form>
    {message ? <p role="status" className={`mt-4 text-sm ${message.type === "error" ? "text-red-700" : "text-green-700"}`}>{message.text}</p> : null}
    {step === "review" || step === "saving" ? <div className="mt-5 space-y-4">{issues.length ? <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm">Foram encontradas divergências na leitura. Revise os valores abaixo.</p> : null}<div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left"><th className="py-2">Ato</th><th>Manual</th><th>Automatizado</th><th>Total</th></tr></thead><tbody>{rows.map((row, index) => <tr key={index} className={`border-b ${isNonAutomatedAct(row.act) ? "bg-red-50" : ""}`}><td className="py-2 pr-3"><input value={row.act} disabled={busy} onChange={(event) => updateRow(index, "act", event.target.value)} className={inputClass} /></td><td className="px-2"><input type="number" value={row.manual} disabled={busy} onChange={(event) => updateRow(index, "manual", event.target.value)} className={`${inputClass} w-28`} /></td><td className="px-2"><input type="number" value={row.automated} disabled={busy} onChange={(event) => updateRow(index, "automated", event.target.value)} className={`${inputClass} w-28`} /></td><td>{(row.manual + row.automated).toLocaleString("pt-BR")}</td></tr>)}</tbody></table></div><div className="flex gap-3"><button type="button" onClick={confirm} disabled={busy} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">{busy ? "Salvando…" : "Confirmar e salvar"}</button><button type="button" onClick={reset} disabled={busy} className="rounded-md border px-4 py-2 text-sm">Cancelar</button></div></div> : null}
  </Card>;
}
