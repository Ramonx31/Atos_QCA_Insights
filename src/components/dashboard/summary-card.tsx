import { Card } from "@/components/ui/card";

interface SummaryCardProps {
  label: string;
  value: number;
  caption: string;
  suffix?: string;
}

export function SummaryCard({ label, value, caption, suffix = "" }: SummaryCardProps) {
  return <Card className="p-5"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-3xl font-semibold">{value.toLocaleString("pt-BR")}{suffix}</p><p className="mt-1 text-sm text-muted-foreground">{caption}</p></Card>;
}
