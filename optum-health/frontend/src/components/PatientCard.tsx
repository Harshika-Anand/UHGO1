import React, { useEffect } from "react";
import { X, User } from "lucide-react";

interface PatientCardProps {
  patient: Record<string, unknown> | null;
  onClose: () => void;
}

function Badge({ text }: { text: string }) {
  const colorMap: Record<string, string> = {
    male: "bg-blue-100 text-blue-700",
    female: "bg-pink-100 text-pink-700",
    other: "bg-purple-100 text-purple-700",
    emergency: "bg-red-100 text-red-700",
    elective: "bg-green-100 text-green-700",
    routine: "bg-slate-100 text-slate-700",
    transfer: "bg-amber-100 text-amber-700",
    icu: "bg-red-100 text-red-700",
    normal: "bg-green-100 text-green-700",
    abnormal: "bg-red-100 text-red-700",
  };
  const key = text.toLowerCase().split(" ")[0];
  const cls = colorMap[key] || "bg-slate-100 text-slate-600";
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      {text}
    </span>
  );
}

const BADGE_FIELDS = new Set(["gender", "admission_type", "ward", "result", "scan_type"]);
const DATE_FIELDS = new Set(["admission_date", "discharge_date", "test_date", "date"]);

function formatValue(key: string, val: unknown): React.ReactNode {
  if (val === null || val === undefined) return <span className="text-slate-400">—</span>;
  const str = String(val);
  if (BADGE_FIELDS.has(key)) return <Badge text={str} />;
  if (DATE_FIELDS.has(key)) {
    try {
      return new Date(str).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    } catch { return str; }
  }
  if (typeof val === "number") return val.toLocaleString();
  return str;
}

function getPatientName(p: Record<string, unknown>): string {
  return (p.name as string) || (p.patient_id as string) || "Patient";
}

function getInitials(name: string): string {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

export default function PatientCard({ patient, onClose }: PatientCardProps) {
  // Keyboard close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!patient) return null;

  const name = getPatientName(patient);
  const initials = getInitials(name);
  const entries = Object.entries(patient).filter(([k]) => k !== "_id");

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <aside className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col animate-slide-up overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-surface-border bg-gradient-to-r from-brand-900 to-brand-700">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/20 text-white font-bold text-lg flex items-center justify-center shrink-0">
              {initials}
            </div>
            <div>
              <h2 className="text-white font-semibold text-base leading-tight">{name}</h2>
              {patient.patient_id && (
                <p className="text-brand-200 text-xs font-mono mt-0.5">{patient.patient_id as string}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="space-y-0.5">
            {entries.map(([key, val]) => (
              <div
                key={key}
                className="flex items-start justify-between py-3 border-b border-surface-border last:border-0 gap-4"
              >
                <span className="text-xs font-semibold text-muted uppercase tracking-wider shrink-0 w-36 pt-0.5">
                  {key.replace(/_/g, " ")}
                </span>
                <span className="text-sm text-slate-800 text-right font-medium flex-1">
                  {formatValue(key, val)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-surface-border bg-slate-50">
          <p className="text-xs text-muted text-center">
            {entries.length} field{entries.length !== 1 ? "s" : ""} · Press <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-xs">Esc</kbd> to close
          </p>
        </div>
      </aside>
    </>
  );
}
