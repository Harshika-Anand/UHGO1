import React, { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, Code2, ChevronDown } from "lucide-react";
import { api, HealthStatus } from "@/utils/api";

interface StatusBarProps {
  mongoQuery?: Record<string, unknown>;
  question?: string;
}

export default function StatusBar({ mongoQuery, question }: StatusBarProps) {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [showQuery, setShowQuery] = useState(false);

  useEffect(() => {
    api.health().then(setHealth).catch(() => setHealth({ status: "error", mongo: "disconnected", version: "-" }));
  }, []);

  return (
    <div className="flex items-center gap-4 text-xs flex-wrap">
      {/* Health indicator */}
      {health && (
        <div className="flex items-center gap-1.5">
          {health.mongo === "connected" ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 text-red-500" />
          )}
          <span className={health.mongo === "connected" ? "text-emerald-600 font-medium" : "text-red-600 font-medium"}>
            MongoDB {health.mongo}
          </span>
        </div>
      )}

      {/* Last query display */}
      {mongoQuery && (
        <div className="relative">
          <button
            onClick={() => setShowQuery((v) => !v)}
            className="flex items-center gap-1.5 text-muted hover:text-slate-700 transition-colors"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Generated query</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${showQuery ? "rotate-180" : ""}`} />
          </button>

          {showQuery && (
            <div className="absolute top-full left-0 mt-2 bg-slate-900 rounded-xl p-4 z-20 shadow-xl w-80 animate-fade-in">
              {question && (
                <p className="text-slate-400 text-xs mb-2 italic">"{question}"</p>
              )}
              <pre className="text-green-400 text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(mongoQuery, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
