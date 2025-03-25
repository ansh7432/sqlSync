import * as React from 'react';
import { useState, useCallback, useRef, useEffect } from 'react';
import { Database, Timer, Filter } from 'lucide-react';
import { sampleQueries } from './data/queries';
import { formatNumber } from './utils/format';

const ITEMS_PER_PAGE = 10;

function App() {
  const [selectedQuery, setSelectedQuery] = useState(sampleQueries[0].id);
  const [queryText, setQueryText] = useState(sampleQueries[0].query);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<null | typeof sampleQueries[0]['results']>(null);
  const [executionTime, setExecutionTime] = useState(0);
  const [visibleRows, setVisibleRows] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [filteredResults, setFilteredResults] = useState<any[] | null>(null);
  const observerTarget = useRef(null);

  // Apply filters to results
  useEffect(() => {
    if (!results) return;
    
    // If no filters are applied, use original results
    if (Object.keys(filters).length === 0 || Object.values(filters).every(v => v === '')) {
      setFilteredResults(results.rows);
      setVisibleRows(results.rows.slice(0, ITEMS_PER_PAGE));
      setPage(2);
      return;
    }

    // Apply all active filters
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

  const loadMoreRows = useCallback(async () => {
    if (loadingMore || !filteredResults) return;

    setLoadingMore(true);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const newRows = filteredResults.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    
    setVisibleRows(prev => [...prev, ...newRows]);
    setPage(prev => prev + 1);
    setLoadingMore(false);
  }, [page, filteredResults, loadingMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && filteredResults && visibleRows.length < filteredResults.length) {
          loadMoreRows();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [loadMoreRows, filteredResults?.length, visibleRows.length]);

  const handleQueryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const query = sampleQueries.find(q => q.id === event.target.value);
    if (query) {
      setSelectedQuery(query.id);
      setQueryText(query.query);
      setResults(null);
      setVisibleRows([]);
      setFilters({});
      setFilteredResults(null);
      setPage(1);
      setExecutionTime(0);
    }
  };

  const handleQueryExecution = useCallback(async () => {
    setIsLoading(true);
    setFilters({});
    const startTime = performance.now();

    // Simulate query execution
    await new Promise(resolve => setTimeout(resolve, 500));

    const query = sampleQueries.find(q => q.id === selectedQuery);
    if (query) {
      setResults(query.results);
      setFilteredResults(query.results.rows);
      setVisibleRows(query.results.rows.slice(0, ITEMS_PER_PAGE));
      setPage(2);
      setExecutionTime(performance.now() - startTime);
    }

    setIsLoading(false);
  }, [selectedQuery]);

  const handleFilterChange = (column: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [column]: value
    }));
  };

  return (
    <div className="app">
      <header className="header">
        <h1>
          <Database className="icon" /> SQL Query Editor
        </h1>
        <p>Run SQL queries and view results instantly</p>
      </header>

      <main>
        <section className="query-section">
          <div className="query-header">
            <select 
              className="query-selector"
              value={selectedQuery}
              onChange={handleQueryChange}
            >
              {sampleQueries.map(query => (
                <option key={query.id} value={query.id}>
                  {query.name}
                </option>
              ))}
            </select>
          </div>

          <textarea
            className="query-editor"
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            placeholder="Enter your SQL query here..."
          />

          <button 
            className="run-button"
            onClick={handleQueryExecution}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="loading" />
            ) : (
              'Run Query'
            )}
          </button>
        </section>

        {results && (
          <section className="results-section">
            <div className="results-header">
              <h2>Query Results</h2>
              <div className="results-info">
                <Timer className="icon" />
                {executionTime > 0 && (
                  <span>{formatNumber(executionTime)}ms</span>
                )}
                {filteredResults && (
                  <span className="filters-info">
                    <Filter className="icon" />
                    Showing {filteredResults.length} of {results.rows.length}
                  </span>
                )}
              </div>
            </div>

            <div className="results-table-wrapper">
              <table className="results-table">
                <thead>
                  <tr>
                    {results.columns.map(column => (
                      <th key={column}>{column}</th>
                    ))}
                  </tr>
                  <tr className="filter-row">
                    {results.columns.map(column => (
                      <th key={`filter-${column}`}>
                        <input
                          type="text"
                          className="filter-input"
                          placeholder={`Filter ${column}`}
                          value={filters[column] || ''}
                          onChange={(e) => handleFilterChange(column, e.target.value)}
                        />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((row, index) => (
                    <tr key={row.id || index}>
                      {results.columns.map(column => (
                        <td key={column}>{String(row[column])}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {loadingMore && (
                <div className="loading-more">
                  <span className="loading" />
                  <span>Loading more results...</span>
                </div>
              )}
              <div ref={observerTarget} style={{ height: '20px' }} />
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;