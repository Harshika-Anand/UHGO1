import React, { useState, KeyboardEvent, useRef, useEffect } from "react";
import { Search, X, Loader2, ChevronDown } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  loading: boolean;
  onClear?: () => void;
  hasResults: boolean;
}

const SUGGESTIONS = [
  "Show patients from India",
  "Patients with Diabetes diagnosis",
  "Patients admitted in last 30 days",
  "Show ICU patients",
  "Patients prescribed Metformin",
  "Emergency admissions this year",
  "Male patients over 60 from USA",
  "Patients with X-ray scans showing abnormal results",
];

export default function SearchBar({ onSearch, loading, onClear, hasResults }: SearchBarProps) {
  const [value, setValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const submit = () => {
    if (!value.trim() || loading) return;
    setShowSuggestions(false);
    onSearch(value.trim());
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") submit();
    if (e.key === "Escape") setShowSuggestions(false);
  };

  const handleClear = () => {
    setValue("");
    onClear?.();
    inputRef.current?.focus();
  };

  const pickSuggestion = (s: string) => {
    setValue(s);
    setShowSuggestions(false);
    onSearch(s);
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      {/* Input row */}
      <div className={`flex items-center gap-2 bg-white border-2 rounded-xl px-4 py-3 shadow-sm transition-all duration-150 ${
        showSuggestions ? "border-brand-500 shadow-md" : "border-surface-border hover:border-slate-300"
      }`}>
        {loading ? (
          <Loader2 className="w-5 h-5 text-brand-500 shrink-0 animate-spin-slow" />
        ) : (
          <Search className="w-5 h-5 text-muted shrink-0" />
        )}

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKey}
          placeholder="Ask anything about patients... (e.g. 'Show patients from India with Diabetes')"
          className="flex-1 bg-transparent outline-none text-sm text-slate-800 placeholder-slate-400 min-w-0"
          disabled={loading}
          autoComplete="off"
        />

        {value && !loading && (
          <button onClick={handleClear} className="shrink-0 p-1 rounded-lg hover:bg-slate-100 transition-colors" title="Clear">
            <X className="w-4 h-4 text-muted" />
          </button>
        )}

        <button
          onClick={() => setShowSuggestions((v) => !v)}
          className="shrink-0 p-1 rounded-lg hover:bg-slate-100 transition-colors border-l border-surface-border pl-3 ml-1"
          title="Example queries"
        >
          <ChevronDown className={`w-4 h-4 text-muted transition-transform ${showSuggestions ? "rotate-180" : ""}`} />
        </button>

        <button
          onClick={submit}
          disabled={!value.trim() || loading}
          className="shrink-0 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors"
        >
          {loading ? "Querying…" : "Search"}
        </button>
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-surface-border rounded-xl shadow-lg z-50 overflow-hidden animate-fade-in">
          <div className="px-4 py-2 border-b border-surface-border">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider">Example queries</span>
          </div>
          <ul>
            {SUGGESTIONS.map((s) => (
              <li key={s}>
                <button
                  onClick={() => pickSuggestion(s)}
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-colors flex items-center gap-2"
                >
                  <Search className="w-3.5 h-3.5 text-muted shrink-0" />
                  {s}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
