import { useState, useEffect } from 'react';
import { QueryResult } from '../types';

const ITEMS_PER_PAGE = 10;

export function useTableFilters(results: QueryResult | null) {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [filteredResults, setFilteredResults] = useState<any[] | null>(null);
  const [visibleRows, setVisibleRows] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);


  useEffect(() => {
    if (!results) return;
    

    if (Object.keys(filters).length === 0 || Object.values(filters).every(v => v === '')) {
      setFilteredResults(results.rows);
      setVisibleRows(results.rows.slice(0, ITEMS_PER_PAGE));
      setPage(2);
      return;
    }


    const filtered = results.rows.filter(row => {
      return Object.entries(filters).every(([column, filterValue]) => {
        if (!filterValue) return true;
        
        const cellValue = String(row[column]).toLowerCase();
        return cellValue.includes(filterValue.toLowerCase());
      });
    });

    setFilteredResults(filtered);
    setVisibleRows(filtered.slice(0, ITEMS_PER_PAGE));
    setPage(2);
  }, [filters, results]);

  const handleFilterChange = (column: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [column]: value
    }));
  };

  const loadMoreRows = async () => {
    if (loadingMore || !filteredResults) return;

    setLoadingMore(true);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const newRows = filteredResults.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    
    setVisibleRows(prev => [...prev, ...newRows]);
    setPage(prev => prev + 1);
    setLoadingMore(false);
  };

  const resetFilters = () => {
    setFilters({});
  };

  return {
    filters,
    filteredResults,
    visibleRows,
    loadingMore,
    handleFilterChange,
    loadMoreRows,
    resetFilters,
    ITEMS_PER_PAGE
  };
}