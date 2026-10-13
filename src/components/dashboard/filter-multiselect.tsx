"use client";

import { useMemo, useState } from "react";

interface FilterMultiSelectProps {
  label: string;
  options: string[];
  selected: string[];
  onChange(selected: string[]): void;
  searchable?: boolean;
}

export function FilterMultiSelect({ label, options, selected, onChange, searchable = false }: FilterMultiSelectProps) {
  const [search, setSearch] = useState("");
  const visible = useMemo(() => options.filter((option) => option.toLocaleLowerCase("pt-BR").includes(search.toLocaleLowerCase("pt-BR"))), [options, search]);
  const toggle = (option: string) => onChange(selected.includes(option) ? selected.filter((item) => item !== option) : [...selected, option]);
  return <fieldset className="min-w-48 rounded-lg border bg-white p-3"><legend className="px-1 text-xs font-medium text-muted-foreground">{label}</legend>{searchable && <input value={search} onChange={(event) => setSearch(event.target.value)} className="mb-2 w-full rounded border px-2 py-1 text-sm" placeholder="Buscar ato" aria-label={`Buscar ${label}`} />}<div className="mb-2 flex gap-3 text-xs"><button type="button" className="text-primary" onClick={() => onChange(options)}>Selecionar todos</button><button type="button" className="text-primary" onClick={() => onChange([])}>Limpar</button></div><div className="max-h-32 space-y-1 overflow-y-auto pr-1">{visible.map((option) => <label key={option} className="flex cursor-pointer items-center gap-2 text-sm"><input type="checkbox" checked={selected.includes(option)} onChange={() => toggle(option)} />{option}</label>)}{visible.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma opção.</p>}</div></fieldset>;
}
