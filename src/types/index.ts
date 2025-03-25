import { Query, QueryResult } from "../data/queries";

export interface HistoryItem {
  id: string;
  query: string;
  timestamp: number;
  name?: string;
}

export interface TableFilter {
  column: string;
  value: string;
}

export interface QueryExecutionState {
  isLoading: boolean;
  results: QueryResult | null;
  executionTime: number;
  error?: string;
}

export type { Query, QueryResult };