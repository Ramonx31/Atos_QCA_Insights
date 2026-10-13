"use client";

import type { DisplayMode } from "@/server/dashboard/types";

export function DisplayModeControl({ value, onChange }: { value: DisplayMode; onChange(value: DisplayMode): void }) {
  return <div className="inline-flex rounded-lg border bg-white p-1" aria-label="Modo de visualização">{(["values", "percentages", "both"] as const).map((mode) => <button key={mode} type="button" onClick={() => onChange(mode)} className={`rounded-md px-3 py-1.5 text-sm ${value === mode ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{mode === "values" ? "Valores" : mode === "percentages" ? "Percentuais" : "Ambos"}</button>)}</div>;
}
