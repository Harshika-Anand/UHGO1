import React, { useState, useCallback } from "react";
import Head from "next/head";
import SearchBar from "@/components/SearchBar";
import ResultsTable from "@/components/ResultsTable";
import PatientCard from "@/components/PatientCard";
import EmptyState from "@/components/EmptyState";
import StatusBar from "@/components/StatusBar";
import { useQuery } from "@/hooks/useQuery";
import { AlertCircle } from "lucide-react";

export default function Home() {
  const { data, loading, error, lastQuestion, runQuery, clearResults } = useQuery();
  const [selectedPatient, setSelectedPatient] = useState<Record<string, unknown> | null>(null);

  const handleSearch = useCallback((q: string) => {
    setSelectedPatient(null);
    runQuery(q);
  }, [runQuery]);

  const handleClear = useCallback(() => {
    setSelectedPatient(null);
    clearResults();
  }, [clearResults]);

  return (
    <>
      <Head>
        <title>OPTUM Health Query</title>
        <meta name="description" content="AI-powered healthcare data query system" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-surface flex flex-col">
        {/* Top header bar */}
        <header className="bg-brand-900 text-white px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
              <span className="text-xs font-bold">O</span>
            </div>
            <span className="font-semibold text-sm tracking-wide">OPTUM Health Query</span>
          </div>
          <StatusBar
            mongoQuery={data?.mongo_query}
            question={lastQuestion}
          />
        </header>

        {/* Search bar — sticky at top of content */}
        <div className="sticky top-0 z-30 bg-white border-b border-surface-border shadow-sm px-6 py-3">
          <div className="max-w-5xl mx-auto">
            <SearchBar
              onSearch={handleSearch}
              loading={loading}
              onClear={handleClear}
              hasResults={!!data}
            />
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 px-6 py-6">
          <div className="max-w-5xl mx-auto space-y-5">

            {/* Error state */}
            {error && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-4 animate-fade-in">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-700">Query failed</p>
                  <p className="text-sm text-red-600 mt-0.5">{error}</p>
                </div>
              </div>
            )}

            {/* Loading skeleton */}
            {loading && (
              <div className="bg-white border border-surface-border rounded-xl p-6 space-y-3 animate-pulse">
                <div className="flex gap-3">
                  <div className="h-4 bg-slate-200 rounded w-24" />
                  <div className="h-4 bg-slate-200 rounded w-16" />
                </div>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="h-3 bg-slate-100 rounded w-24" />
                    <div className="h-3 bg-slate-100 rounded flex-1" />
                    <div className="h-3 bg-slate-100 rounded w-20" />
                    <div className="h-3 bg-slate-100 rounded w-16" />
                  </div>
                ))}
              </div>
            )}

            {/* Results table */}
            {!loading && data && data.results.length > 0 && (
              <ResultsTable
                results={data.results}
                collection={data.collection}
                count={data.count}
                elapsedMs={data.elapsed_ms}
                onRowClick={setSelectedPatient}
              />
            )}

            {/* Zero results */}
            {!loading && data && data.results.length === 0 && (
              <div className="bg-white border border-surface-border rounded-xl px-6 py-10 text-center animate-fade-in">
                <p className="text-slate-500 font-medium">No results found</p>
                <p className="text-muted text-sm mt-1">Try broadening your search criteria</p>
              </div>
            )}

            {/* Empty / welcome state */}
            {!loading && !data && !error && (
              <EmptyState onSuggestion={handleSearch} />
            )}
          </div>
        </main>
      </div>

      {/* Patient profile slide-in */}
      {selectedPatient && (
        <PatientCard
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
        />
      )}
    </>
  );
}
