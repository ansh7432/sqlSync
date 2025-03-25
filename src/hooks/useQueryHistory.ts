import { useState, useEffect } from 'react';
import { HistoryItem } from '../types';

export function useQueryHistory() {
  const [queryHistory, setQueryHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

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

  const addToHistory = (historyItem: Omit<HistoryItem, 'id'>) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      ...historyItem
    };
    
    // Only add to history if it's a new query
    if (!queryHistory.some(item => item.query === newItem.query)) {
      setQueryHistory(prev => [newItem, ...prev].slice(0, 50)); // Keep only the 50 most recent queries
    }
  };

  const removeFromHistory = (itemId: string) => {
    setQueryHistory(prev => prev.filter(item => item.id !== itemId));
  };

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear all query history?')) {
      setQueryHistory([]);
      setShowHistory(false);
    }
  };

  return {
    queryHistory,
    showHistory,
    setShowHistory,
    addToHistory,
    removeFromHistory,
    clearHistory
  };
}