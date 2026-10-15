import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type SummaryTone = "neutral" | "manual" | "automated" | "primary";

interface SummaryCardProps {
  label: string;
  value: number;
  caption: string;
  suffix?: string;
  icon?: ReactNode;
  tone?: SummaryTone;
}

const toneStyles: Record<SummaryTone, { card: string; icon: string }> = {
  neutral: { card: "border-slate-200", icon: "bg-slate-100 text-slate-700" },
  manual: { card: "border-amber-200 bg-amber-50/40", icon: "bg-amber-100 text-amber-800" },
  automated: { card: "border-blue-200 bg-blue-50/40", icon: "bg-blue-100 text-blue-800" },
  primary: { card: "border-primary/20 bg-primary/[0.03]", icon: "bg-primary/10 text-primary" },
};

export function SummaryCard({ label, value, caption, suffix = "", icon, tone = "neutral" }: SummaryCardProps) {
  const styles = toneStyles[tone];
  return <Card className={cn("relative overflow-hidden p-5", styles.card)}>
    <div className="flex items-start justify-between gap-3"><p className="text-sm font-medium text-muted-foreground">{label}</p>{icon ? <span className={cn("grid size-9 place-items-center rounded-lg", styles.icon)}>{icon}</span> : null}</div>
    <p className="mt-3 text-3xl font-bold tracking-tight tabular-nums">{value.toLocaleString("pt-BR")}{suffix}</p>
    <p className="mt-1 text-sm text-muted-foreground">{caption}</p>
  </Card>;
}
