import { useState, useCallback } from "react";
import { api, QueryResult } from "@/utils/api";

interface QueryState {
  data: QueryResult | null;
  loading: boolean;
  error: string | null;
  lastQuestion: string;
}

export function useQuery() {
  const [state, setState] = useState<QueryState>({
    data: null,
    loading: false,
    error: null,
    lastQuestion: "",
  });

  const runQuery = useCallback(async (question: string) => {
    if (!question.trim()) return;

    setState((s) => ({ ...s, loading: true, error: null, lastQuestion: question }));

    try {
      const result = await api.query(question);
      setState({ data: result, loading: false, error: null, lastQuestion: question });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Query failed";
      setState((s) => ({ ...s, loading: false, error: message }));
    }
  }, []);

  const clearResults = useCallback(() => {
    setState({ data: null, loading: false, error: null, lastQuestion: "" });
  }, []);

  return { ...state, runQuery, clearResults };
}
