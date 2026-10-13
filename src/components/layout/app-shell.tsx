import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  return <div className="min-h-screen"><header className="border-b bg-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4"><div><p className="text-sm font-medium text-primary">QCA Insights</p><h1 className="text-lg font-semibold">Painel de Automação de Atos</h1></div></div></header><main className="mx-auto max-w-7xl px-6 py-8">{children}</main></div>;
}
