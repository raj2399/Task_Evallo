const express = require('express');
const app = express();
const PORT = 3001;
const fs = require('fs');
const path = require('path');

app.use(express.json());

const LOGS_FILE = path.join(__dirname, 'logs.json');

function ensureLogsFile() {
  if (!fs.existsSync(LOGS_FILE)) {
    fs.writeFileSync(LOGS_FILE, '[]', 'utf-8');
  }
}

function readLogs() {
  ensureLogsFile();
  const data = fs.readFileSync(LOGS_FILE, 'utf-8');
  return JSON.parse(data);
}

function writeLogs(logs) {
  fs.writeFileSync(LOGS_FILE, JSON.stringify(logs, null, 2), 'utf-8');
}

function validateLog(log) {
  const levels = ['error', 'warn', 'info', 'debug'];
  if (
    typeof log !== 'object' ||
    !levels.includes(log.level) ||
    typeof log.message !== 'string' ||
    typeof log.resourceId !== 'string' ||
    typeof log.timestamp !== 'string' ||
    typeof log.traceId !== 'string' ||
    typeof log.spanId !== 'string' ||
    typeof log.commit !== 'string' ||
    typeof log.metadata !== 'object' || Array.isArray(log.metadata)
  ) {
    return false;
  }
  if (isNaN(Date.parse(log.timestamp))) return false;
  return true;
}

app.post('/logs', (req, res) => {
  const log = req.body;
  if (!validateLog(log)) {
    return res.status(400).json({ error: 'Invalid log schema' });
  }
  try {
    const logs = readLogs();
    logs.push(log);
    writeLogs(logs);
    res.status(201).json(log);
  } catch (err) {
    res.status(500).json({ error: 'Failed to persist log' });
  }
});

app.get('/logs', (req, res) => {
  try {
    const logs = readLogs();
    let filteredLogs = [...logs];
    const { level, message, resourceId, timestamp_start, timestamp_end, traceId, spanId, commit, page = 1, limit = 10 } = req.query;
    
    if (level) {
      filteredLogs = filteredLogs.filter(log => log.level === level);
    }
    if (message) {
      const searchTerm = message.toLowerCase();
      filteredLogs = filteredLogs.filter(log => 
        log.message.toLowerCase().includes(searchTerm)
      );
    }
    if (resourceId) {
      filteredLogs = filteredLogs.filter(log => log.resourceId === resourceId);
    }
    if (timestamp_start) {
      const startTime = new Date(timestamp_start);
      if (!isNaN(startTime.getTime())) {
        filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= startTime);
      }
    }
    if (timestamp_end) {
      const endTime = new Date(timestamp_end);
      if (!isNaN(endTime.getTime())) {
        filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= endTime);
      }
    }
    if (traceId) {
      filteredLogs = filteredLogs.filter(log => log.traceId === traceId);
    }
    if (spanId) {
      filteredLogs = filteredLogs.filter(log => log.spanId === spanId);
    }
    if (commit) {
      filteredLogs = filteredLogs.filter(log => log.commit === commit);
    }
    
    filteredLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const startIdx = (pageNum - 1) * limitNum;
    const paginatedLogs = filteredLogs.slice(startIdx, startIdx + limitNum);
    
    const response = {
      logs: paginatedLogs,
      total: filteredLogs.length,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(filteredLogs.length / limitNum)
    };
    
    res.json(response);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve logs' });
  }
});

app.get('/', (req, res) => {
  res.send({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}).on('error', (err) => {
  console.error('Server error:', err);
}); 