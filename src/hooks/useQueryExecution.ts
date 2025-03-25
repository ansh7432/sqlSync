import { useState, useCallback } from 'react';
import { sampleQueries } from '../data/queries';
import { QueryExecutionState } from '../types';

export function useQueryExecution() {
  const [selectedQuery, setSelectedQuery] = useState(sampleQueries[0].id);
  const [queryText, setQueryText] = useState(sampleQueries[0].query);
  const [executionState, setExecutionState] = useState<QueryExecutionState>({
    isLoading: false,
    results: null,
    executionTime: 0
  });

  const handleQueryChange = (queryId: string) => {
    const query = sampleQueries.find(q => q.id === queryId);
    if (query) {
      setSelectedQuery(query.id);
      setQueryText(query.query);
      setExecutionState({
        isLoading: false,
        results: null,
        executionTime: 0
      });
    }
  };

  const executeQuery = useCallback(async () => {
    if (!queryText.trim()) return;
    
    setExecutionState(prev => ({
      ...prev,
      isLoading: true
    }));
    
    const startTime = performance.now();

    // Simulate query execution
    await new Promise(resolve => setTimeout(resolve, 500));

    const query = sampleQueries.find(q => q.id === selectedQuery);
    if (query) {
      setExecutionState({
        isLoading: false,
        results: query.results,
        executionTime: performance.now() - startTime
      });
    }
  }, [selectedQuery, queryText]);

  // New reset function
  const resetQuery = useCallback(() => {
    const query = sampleQueries.find(q => q.id === selectedQuery);
    if (query) {
      setQueryText(query.query);
      setExecutionState({
        isLoading: false,
        results: null,
        executionTime: 0
      });
    }
  }, [selectedQuery]);

  return {
    selectedQuery,
    queryText,
    setQueryText,
    handleQueryChange,
    executeQuery,
    resetQuery,  // Add this function to the return object
    ...executionState
  };
}