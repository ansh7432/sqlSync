import { useRef, useEffect } from 'react';
import { ThemeToggle } from './components/common/ThemeToggle';
import { Header } from './components/layout/Header';
import { QuerySelector } from './components/query/QuerySelector';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { Toast } from './components/common/Toast';
import { Filter, Timer, Clock, X, RefreshCw } from 'lucide-react';
import { useQueryExecution } from './hooks/useQueryExecution';
import { useQueryHistory } from './hooks/useQueryHistory';
import { useTableFilters } from './hooks/useTableFilters';
import { useToast } from './hooks/useToast';
import { formatNumber } from './utils/format';
import { sampleQueries } from './data/queries';

function App() {
  const { 
    selectedQuery, 
    queryText, 
    setQueryText, 
    handleQueryChange, 
    executeQuery,
    resetQuery, 
    isLoading, 
    results, 
    executionTime 
  } = useQueryExecution();
  
  const {
    queryHistory,
    showHistory,
    setShowHistory,
    addToHistory,
    removeFromHistory,
    clearHistory
  } = useQueryHistory();
  
  const {
    filters,
    filteredResults,
    visibleRows,
    loadingMore,
    handleFilterChange,
    loadMoreRows,
    resetFilters
  } = useTableFilters(results);
  
  const { toast, showToast, hideToast } = useToast();
  
  const observerTarget = useRef(null);
  const historyRef = useRef<HTMLDivElement>(null);

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
  }, [historyRef, setShowHistory]);

  // Infinite scroll observer
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

  // Handle query execution and update history
  const handleExecuteQuery = async () => {   
    if (!queryText.trim()) {
      showToast('Please enter a SQL query before executing', 'warning');
      return;
    }
    
    await executeQuery();
    

    addToHistory({
      query: queryText,
      timestamp: Date.now(),
      name: sampleQueries.find(q => q.id === selectedQuery)?.name
    });
    
    resetFilters();
  };

  const handleReset = () => {
    resetQuery();
    resetFilters();
  };

  const loadHistoryItem = (query: string) => {
    setQueryText(query);
    setShowHistory(false);


    const matchingSampleQuery = sampleQueries.find(q => q.query === query);
    if (matchingSampleQuery) {
      handleQueryChange(matchingSampleQuery.id);
    } else {
      handleQueryChange('custom');
    }
  };

  return (
    <div className="app">
      <ThemeToggle />
      <Header />
      
      <div className="toast-container">
        <Toast
          message={toast.message}
          type={toast.type}
          visible={toast.visible}
          onClose={hideToast}
        />
      </div>

      <main>
        <section className="query-section">
          <div className="query-header">
            <QuerySelector
              selectedQuery={selectedQuery}
              onChange={handleQueryChange}
            />
            
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
                        <li key={item.id} onClick={() => loadHistoryItem(item.query)}>
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
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFromHistory(item.id);
                              }}
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

          <div className="button-group">
            <button 
              className="reset-button"
              onClick={handleReset}
              title="Reset query and results"
            >
              <RefreshCw size={18} />
              Reset
            </button>
            
            <button 
              className="run-button"
              onClick={handleExecuteQuery}
              disabled={isLoading}
            >
              {isLoading ? <LoadingSpinner /> : 'Run Query'}
            </button>
          </div>
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
                  <LoadingSpinner />
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