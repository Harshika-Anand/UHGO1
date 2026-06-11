import React from "react";
import { MessageSquare } from "lucide-react";

const SAMPLE_QUERIES = [
  { label: "Patients from India", query: "Show patients from India" },
  { label: "Diabetes cases", query: "Patients with Diabetes diagnosis" },
  { label: "Last 30 days admissions", query: "Patients admitted in last 30 days" },
  { label: "ICU patients", query: "Show ICU patients" },
];

interface EmptyStateProps {
  onSuggestion: (q: string) => void;
}

export default function EmptyState({ onSuggestion }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mb-5">
        <MessageSquare className="w-8 h-8 text-brand-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-700 mb-1.5">
        Ask about your patient data
      </h3>
      <p className="text-muted text-sm max-w-sm mb-8">
        Type a natural language question above. The AI will translate it to a MongoDB query and return up to 100 results.
      </p>
      <div className="flex flex-wrap gap-2 justify-center">
        {SAMPLE_QUERIES.map((s) => (
          <button
            key={s.query}
            onClick={() => onSuggestion(s.query)}
            className="px-3.5 py-2 text-sm text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 rounded-lg transition-colors font-medium"
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
