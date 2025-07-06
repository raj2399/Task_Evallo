import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    level: '',
    message: '',
    resourceId: '',
    timestamp_start: '',
    timestamp_end: '',
    traceId: '',
    spanId: '',
    commit: ''
  });
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          queryParams.append(key, value);
        }
      });
      queryParams.append('page', page);
      queryParams.append('limit', limit);
      const response = await fetch(`/logs?${queryParams}`);
      if (response.ok) {
        const data = await response.json();
        // Always set logs to an array, never an object
        setLogs(Array.isArray(data.logs) ? data.logs : []);
        setTotalPages(data.totalPages || 1);
        setTotal(data.total || 0);
      } else {
        setLogs([]);
        setTotalPages(1);
        setTotal(0);
        console.error('Failed to fetch logs');
      }
    } catch (error) {
      setLogs([]);
      setTotalPages(1);
      setTotal(0);
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line
  }, [filters, page]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPage(1);
  };

  const getLogLevelColor = (level) => {
    switch (level) {
      case 'error': return '#ffebee';
      case 'warn': return '#fff3e0';
      case 'info': return '#e3f2fd';
      case 'debug': return '#f3e5f5';
      default: return '#fafafa';
    }
  };

  const getLogLevelBorderColor = (level) => {
    switch (level) {
      case 'error': return '#f44336';
      case 'warn': return '#ff9800';
      case 'info': return '#2196f3';
      case 'debug': return '#9c27b0';
      default: return '#e0e0e0';
    }
  };

  const handlePrevPage = () => {
    setPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setPage(prev => Math.min(prev + 1, totalPages));
  };

  // Debug: log the logs state
  console.log('logs state:', logs);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Log Query System</h1>
      </header>
      <main className="App-main">
        <div className="filter-bar">
          <div className="filter-row">
            <div className="filter-group">
              <label>Message Search:</label>
              <input
                type="text"
                placeholder="Search in message..."
                value={filters.message}
                onChange={(e) => handleFilterChange('message', e.target.value)}
              />
            </div>
            <div className="filter-group">
              <label>Level:</label>
              <select
                value={filters.level}
                onChange={(e) => handleFilterChange('level', e.target.value)}
              >
                <option value="">All Levels</option>
                <option value="error">Error</option>
                <option value="warn">Warning</option>
                <option value="info">Info</option>
                <option value="debug">Debug</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Resource ID:</label>
              <input
                type="text"
                placeholder="Filter by resource ID..."
                value={filters.resourceId}
                onChange={(e) => handleFilterChange('resourceId', e.target.value)}
              />
            </div>
          </div>
          <div className="filter-row">
            <div className="filter-group">
              <label>Start Time:</label>
              <input
                type="datetime-local"
                value={filters.timestamp_start}
                onChange={(e) => handleFilterChange('timestamp_start', e.target.value)}
              />
            </div>
            <div className="filter-group">
              <label>End Time:</label>
              <input
                type="datetime-local"
                value={filters.timestamp_end}
                onChange={(e) => handleFilterChange('timestamp_end', e.target.value)}
              />
            </div>
            <div className="filter-group">
              <label>Trace ID:</label>
              <input
                type="text"
                placeholder="Filter by trace ID..."
                value={filters.traceId}
                onChange={(e) => handleFilterChange('traceId', e.target.value)}
              />
            </div>
            <div className="filter-group">
              <label>Span ID:</label>
              <input
                type="text"
                placeholder="Filter by span ID..."
                value={filters.spanId}
                onChange={(e) => handleFilterChange('spanId', e.target.value)}
              />
            </div>
            <div className="filter-group">
              <label>Commit:</label>
              <input
                type="text"
                placeholder="Filter by commit..."
                value={filters.commit}
                onChange={(e) => handleFilterChange('commit', e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="log-results">
          {loading ? (
            <div className="loading">Loading logs...</div>
          ) : !Array.isArray(logs) || logs.length === 0 ? (
            <div className="no-logs">No logs found matching the current filters.</div>
          ) : (
            <>
              <div className="log-list">
                {logs.map((log, index) => (
                  <div
                    key={`${log.timestamp}-${index}`}
                    className="log-entry"
                    style={{
                      backgroundColor: getLogLevelColor(log.level),
                      borderLeft: `4px solid ${getLogLevelBorderColor(log.level)}`
                    }}
                  >
                    <div className="log-header">
                      <span className="log-level">{log.level.toUpperCase()}</span>
                      <span className="log-timestamp">{new Date(log.timestamp).toLocaleString()}</span>
                      <span className="log-resource">{log.resourceId}</span>
                    </div>
                    <div className="log-message">{log.message}</div>
                    <div className="log-details">
                      <span>Trace ID: {log.traceId}</span>
                      <span>Span ID: {log.spanId}</span>
                      <span>Commit: {log.commit}</span>
                    </div>
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <div className="log-metadata">
                        <strong>Metadata:</strong> {JSON.stringify(log.metadata)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="pagination-bar">
                <div className="pagination-info">
                  <span>Limit: {limit} records</span>
                  <span>Total logs: {total}</span>
                </div>
                <div className="pagination-controls">
                  <button onClick={handlePrevPage} disabled={page === 1}>&lt; Prev</button>
                  <span>Page {page} of {totalPages}</span>
                  <button onClick={handleNextPage} disabled={page === totalPages || totalPages === 0}>Next &gt;</button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default App; 