import * as React from 'react';
import { useState, useCallback, useRef, useEffect } from 'react';
import { Database, Timer, Filter, Clock, X } from 'lucide-react';
import { sampleQueries } from './data/queries';
import { formatNumber } from './utils/format';

const ITEMS_PER_PAGE = 10;

// Define interface for history items
interface HistoryItem {
  id: string;
  query: string;
  timestamp: number;
  name?: string;
}

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
  const [queryHistory, setQueryHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const observerTarget = useRef(null);
  const historyRef = useRef<HTMLDivElement>(null);

  // Load query history from localStorage on initial load
  useEffect(() => {
    const savedHistory = localStorage.getItem('queryHistory');
    if (savedHistory) {
      try {
        setQueryHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse query history', e);
      }
    }
  }, []);

  // Save query history to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('queryHistory', JSON.stringify(queryHistory));
  }, [queryHistory]);

  // Close history panel when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (historyRef.current && !historyRef.current.contains(event.target as Node)) {
        setShowHistory(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [historyRef]);

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
    if (!queryText.trim()) return;
    
    setIsLoading(true);
    setFilters({});
    const startTime = performance.now();

    // Add to history
    const historyItem: HistoryItem = {
      id: Date.now().toString(),
      query: queryText,
      timestamp: Date.now(),
      name: sampleQueries.find(q => q.id === selectedQuery)?.name
    };
    
    // Only add to history if it's a new query
    if (!queryHistory.some(item => item.query === queryText)) {
      setQueryHistory(prev => [historyItem, ...prev].slice(0, 50)); // Keep only the 50 most recent queries
    }

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
  }, [selectedQuery, queryText, queryHistory]);

  const handleFilterChange = (column: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [column]: value
    }));
  };

  const loadHistoryItem = (historyItem: HistoryItem) => {
    setQueryText(historyItem.query);
    setShowHistory(false);

    // Find if the query matches a predefined sample query
    const matchingSampleQuery = sampleQueries.find(q => q.query === historyItem.query);
    if (matchingSampleQuery) {
      setSelectedQuery(matchingSampleQuery.id);
    } else {
      // If no matching sample query, use a custom ID
      setSelectedQuery('custom');
    }
  };

  const removeHistoryItem = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    setQueryHistory(prev => prev.filter(item => item.id !== itemId));
  };

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear all query history?')) {
      setQueryHistory([]);
      setShowHistory(false);
    }
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
            
            <div className="history-container">
              <button 
                className="history-button"
                onClick={() => setShowHistory(!showHistory)}
                title="Query History"
              >
                <Clock size={18} />
                <span>History</span>
              </button>
              
              {showHistory && (
                <div className="history-panel" ref={historyRef}>
                  <div className="history-header">
                    <h3>Query History</h3>
                    <button className="clear-history" onClick={clearHistory}>
                      Clear All
                    </button>
                  </div>
                  
                  {queryHistory.length === 0 ? (
                    <div className="no-history">No history yet</div>
                  ) : (
                    <ul className="history-list">
                      {queryHistory.map(item => (
                        <li key={item.id} onClick={() => loadHistoryItem(item)}>
                          <div className="history-item">
                            <div className="history-item-name">
                              {item.name || 'Custom Query'}
                            </div>
                            <div className="history-item-time">
                              {new Date(item.timestamp).toLocaleString()}
                            </div>
                            <div className="history-item-query">
                              {item.query.substring(0, 100)}
                              {item.query.length > 100 ? '...' : ''}
                            </div>
                            <button 
                              className="remove-history-item"
                              onClick={(e) => removeHistoryItem(e, item.id)}
                              title="Remove from history"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
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