"use client";

import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import type { DashboardActAggregate } from "@/components/dashboard/calculations";

const column = createColumnHelper<DashboardActAggregate>();
const number = (value: number) => value.toLocaleString("pt-BR");
const percentage = (value: number) => `${value.toFixed(1)}%`;
const columns = [column.accessor("actName", { header: "Ato" }), column.accessor("manual", { header: "Manual", cell: (info) => number(info.getValue()) }), column.accessor("automated", { header: "Automatizado", cell: (info) => number(info.getValue()) }), column.accessor("total", { header: "Total", cell: (info) => number(info.getValue()) }), column.accessor("manualPercentage", { header: "% Manual", cell: (info) => percentage(info.getValue()) }), column.accessor("automatedPercentage", { header: "% Automatizado", cell: (info) => percentage(info.getValue()) })];

export function ActDetailTable({ data }: { data: DashboardActAggregate[] }) {
  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });
  return <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-muted text-muted-foreground">{table.getHeaderGroups().map((group) => <tr key={group.id}>{group.headers.map((header) => <th key={header.id} className="px-4 py-3 font-medium">{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</th>)}</tr>)}</thead><tbody>{table.getRowModel().rows.map((row) => <tr className="border-t" key={row.id}>{row.getVisibleCells().map((cell) => <td className="px-4 py-3" key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}</tr>)}{data.length === 0 && <tr><td className="px-4 py-8 text-center text-muted-foreground" colSpan={columns.length}>Nenhum resultado para os filtros selecionados.</td></tr>}</tbody></table></div>;
}
