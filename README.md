# Log Ingestion and Querying System

A self-contained logging system with a backend API for log ingestion and a React frontend for log querying and filtering.

## Project Structure

```
Task-eva/
├── backend/           # Node.js + Express API server
│   ├── server.js      # Main server file with API endpoints
│   ├── logs.json      # JSON file database for log storage
│   ├── package.json   # Backend dependencies
└── frontend/          # React frontend application
    ├── public/        # Static files
    ├── src/           # React source code
    │   ├── App.js     # Main React component
    │   ├── App.css    # Styling
    │   ├── index.js   # React entry point
    │   └── index.css  # Global styles
    └── package.json   # Frontend dependencies
```

## Features

### Backend API
- **POST /logs**: Ingest log entries with schema validation
- **GET /logs**: Query logs with comprehensive filtering
- **Data Persistence**: Single JSON file database (no external DB required)
- **Schema Validation**: Ensures log entries conform to required format

### Frontend Interface
- **Filter Bar**: Search and filter logs by multiple criteria
- **Real-time Filtering**: Dynamic updates as filters change
- **Visual Log Levels**: Color-coded log entries by severity
- **Responsive Design**: Works on desktop and mobile devices
- **Clean UI**: Professional developer tool interface

## API Specification

### Log Data Schema
```json
{
  "level": "error|warn|info|debug",
  "message": "string",
  "resourceId": "string",
  "timestamp": "ISO 8601 string",
  "traceId": "string",
  "spanId": "string",
  "commit": "string",
  "metadata": "object"
}
```

### API Endpoints

#### POST /logs
- **Purpose**: Ingest a single log entry
- **Body**: Log object conforming to schema
- **Response**: 201 Created with the ingested log, or 400 Bad Request for invalid schema

#### GET /logs
- **Purpose**: Retrieve filtered logs
- **Query Parameters** (all optional):
  - `level`: Filter by log level
  - `message`: Full-text search in message field
  - `resourceId`: Filter by resource ID
  - `timestamp_start`: Start time (ISO 8601)
  - `timestamp_end`: End time (ISO 8601)
  - `traceId`: Filter by trace ID
  - `spanId`: Filter by span ID
  - `commit`: Filter by commit hash
- **Response**: 200 OK with array of matching logs (reverse chronological order)

## Installation and Setup

### Backend Setup
```bash
cd backend
npm install
npm start
```

The backend server will start on port 3001.

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

The frontend will start on port 3000 and proxy API requests to the backend.

## Usage

### Adding Logs
Send POST requests to `http://localhost:3001/logs` with log data:

```bash
curl -X POST http://localhost:3001/logs \
  -H "Content-Type: application/json" \
  -d '{
    "level": "error",
    "message": "Failed to connect to database",
    "resourceId": "server-1234",
    "timestamp": "2023-09-15T08:00:00Z",
    "traceId": "abc-xyz-123",
    "spanId": "span-456",
    "commit": "5e5342f",
    "metadata": {"parentResourceId": "server-5678"}
  }'
```

### Querying Logs
Use the frontend interface or send GET requests to `http://localhost:3001/logs`:

```bash
# Get all logs
curl http://localhost:3001/logs

# Filter by level
curl "http://localhost:3001/logs?level=error"

# Search in message
curl "http://localhost:3001/logs?message=database"

# Filter by resource and time range
curl "http://localhost:3001/logs?resourceId=server-1234&timestamp_start=2023-09-15T00:00:00Z&timestamp_end=2023-09-15T23:59:59Z"
```

## Technical Implementation

### Backend
- **Node.js + Express**: RESTful API server
- **File System**: JSON file persistence using Node's `fs` module
- **Schema Validation**: Custom validation logic for log entries
- **Filtering**: In-memory filtering using JavaScript Array methods
- **Error Handling**: Comprehensive error responses

### Frontend
- **React 18**: Modern React with hooks
- **State Management**: Component-level state with useState and useEffect
- **API Integration**: Fetch API for backend communication
- **Responsive Design**: CSS Grid and Flexbox for layout
- **Visual Design**: Professional UI with color-coded log levels

## Testing

Run the API test script to verify functionality:

```bash
cd backend
node test-api.js
```

This will add sample logs and test various filtering scenarios.

## Design Decisions

1. **JSON File Database**: Chosen for simplicity and to demonstrate in-memory data manipulation skills
2. **Single Page Application**: React frontend for smooth user experience
3. **Real-time Filtering**: Immediate feedback as users modify filters
4. **Color-coded Log Levels**: Visual distinction for quick log analysis
5. **Responsive Design**: Works across different screen sizes
6. **Professional UI**: Clean, modern interface inspired by tools like Grafana and Datadog

## Future Enhancements

- Pagination for large log datasets
- Export functionality (CSV, JSON)
- Advanced search with regex support
- Log aggregation and statistics
- Real-time log streaming
- User authentication and authorization
- Database migration (PostgreSQL, MongoDB) 

## Bonus: Pagination Feature

- The log viewer supports pagination for large datasets.
- By default, 10 records are shown per page.
- Users can navigate between pages using the pagination controls at the bottom of the log list.
- The total number of logs and the current page are always visible for clarity. 