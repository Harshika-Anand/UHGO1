import React, { useState, useMemo } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

interface ResultsTableProps {
  results: Record<string, unknown>[];
  collection: string;
  count: number;
  elapsedMs: number;
  onRowClick: (row: Record<string, unknown>) => void;
}

type SortDir = "asc" | "desc" | null;

function cellValue(v: unknown): string {
  if (v === null || v === undefined) return "—";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

function SortIcon({ field, sortField, sortDir }: { field: string; sortField: string | null; sortDir: SortDir }) {
  if (sortField !== field) return <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400" />;
  return sortDir === "asc" ? <ChevronUp className="w-3.5 h-3.5 text-brand-600" /> : <ChevronDown className="w-3.5 h-3.5 text-brand-600" />;
}

export default function ResultsTable({ results, collection, count, elapsedMs, onRowClick }: ResultsTableProps) {
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);

  // Derive columns from first row
  const columns = useMemo(() => {
    if (!results.length) return [];
    return Object.keys(results[0]);
  }, [results]);

  // Client-side sort (already limited to 100 rows)
  const sorted = useMemo(() => {
    if (!sortField || !sortDir) return results;
    return [...results].sort((a, b) => {
      const av = cellValue(a[sortField]);
      const bv = cellValue(b[sortField]);
      const cmp = av.localeCompare(bv, undefined, { numeric: true, sensitivity: "base" });
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [results, sortField, sortDir]);

  const handleSort = (col: string) => {
    if (sortField !== col) {
      setSortField(col);
      setSortDir("asc");
    } else if (sortDir === "asc") {
      setSortDir("desc");
    } else {
      setSortField(null);
      setSortDir(null);
    }
  };

  if (!results.length) return null;

  return (
    <div className="flex flex-col bg-white border border-surface-border rounded-xl shadow-sm overflow-hidden animate-slide-up">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-surface-border bg-slate-50">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 inline-block" />
            {collection}
          </span>
          <span className="text-sm text-muted">
            <span className="font-semibold text-slate-800">{count}</span> result{count !== 1 ? "s" : ""}
            {count === 100 && (
              <span className="ml-1 text-amber-600 font-medium">(capped at 100)</span>
            )}
          </span>
        </div>
        <span className="text-xs text-muted font-mono">{elapsedMs}ms</span>
      </div>

      {/* Scrollable table */}
      <div className="overflow-x-auto overflow-y-auto max-h-[520px]">
        <table className="w-full text-sm border-collapse">
          <thead className="sticky top-0 z-10 bg-slate-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  onClick={() => handleSort(col)}
                  className="text-left px-4 py-2.5 font-semibold text-slate-600 text-xs uppercase tracking-wide border-b border-surface-border cursor-pointer select-none whitespace-nowrap hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    {col.replace(/_/g, " ")}
                    <SortIcon field={col} sortField={sortField} sortDir={sortDir} />
                  </div>
                </th>
              ))}
              <th className="px-4 py-2.5 border-b border-surface-border w-10" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, idx) => (
              <tr
                key={idx}
                onClick={() => onRowClick(row)}
                className={`table-row-hover border-b border-surface-border last:border-0 ${
                  idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                }`}
              >
                {columns.map((col) => (
                  <td key={col} className="px-4 py-2.5 text-slate-700 whitespace-nowrap max-w-[220px] truncate" title={cellValue(row[col])}>
                    {cellValue(row[col])}
                  </td>
                ))}
                <td className="px-4 py-2.5 text-right">
                  <span className="text-xs text-brand-500 font-medium opacity-0 group-hover:opacity-100">View →</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-5 py-2 text-xs text-muted border-t border-surface-border bg-slate-50">
        Click any row to view full patient profile
      </div>
    </div>
  );
}
