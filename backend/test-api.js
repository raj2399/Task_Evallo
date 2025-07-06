const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const BASE_URL = 'http://localhost:3001';

async function testAPI() {
  console.log('Testing Log Ingestion and Querying API...\n');

  // Sample log entries
  const sampleLogs = [
    {
      level: 'error',
      message: 'Failed to connect to database',
      resourceId: 'server-1234',
      timestamp: '2023-09-15T08:00:00Z',
      traceId: 'abc-xyz-123',
      spanId: 'span-456',
      commit: '5e5342f',
      metadata: { parentResourceId: 'server-5678' }
    },
    {
      level: 'info',
      message: 'Application started successfully',
      resourceId: 'server-1234',
      timestamp: '2023-09-15T08:01:00Z',
      traceId: 'def-uvw-456',
      spanId: 'span-789',
      commit: '5e5342f',
      metadata: { parentResourceId: 'server-5678' }
    },
    {
      level: 'warn',
      message: 'High memory usage detected',
      resourceId: 'server-5678',
      timestamp: '2023-09-15T08:02:00Z',
      traceId: 'ghi-rst-789',
      spanId: 'span-012',
      commit: '5e5342f',
      metadata: { parentResourceId: 'server-1234' }
    }
  ];

  try {
    // Test POST /logs
    console.log('1. Testing POST /logs...');
    for (const log of sampleLogs) {
      const response = await fetch(`${BASE_URL}/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(log)
      });
      if (response.ok) {
        const result = await response.json();
        console.log(`   ✓ Added log: ${log.level} - ${log.message}`);
      } else {
        console.log(`   ✗ Failed to add log: ${response.status}`);
      }
    }

    // Test GET /logs (all logs)
    console.log('\n2. Testing GET /logs (all logs)...');
    const allLogsResponse = await fetch(`${BASE_URL}/logs`);
    if (allLogsResponse.ok) {
      const data = await allLogsResponse.json();
      console.log(`   ✓ Retrieved ${data.logs.length} logs (showing first 3):`);
      data.logs.slice(0, 3).forEach(log => {
        console.log(`     - ${log.timestamp}: ${log.level} - ${log.message}`);
      });
    }

    // Test filtering by level
    console.log('\n3. Testing GET /logs?level=error...');
    const errorLogsResponse = await fetch(`${BASE_URL}/logs?level=error`);
    if (errorLogsResponse.ok) {
      const data = await errorLogsResponse.json();
      console.log(`   ✓ Retrieved ${data.logs.length} error logs`);
    }

    // Test message search
    console.log('\n4. Testing GET /logs?message=database...');
    const searchResponse = await fetch(`${BASE_URL}/logs?message=database`);
    if (searchResponse.ok) {
      const data = await searchResponse.json();
      console.log(`   ✓ Retrieved ${data.logs.length} logs containing "database"`);
    }

    // Test resourceId filter
    console.log('\n5. Testing GET /logs?resourceId=server-1234...');
    const resourceResponse = await fetch(`${BASE_URL}/logs?resourceId=server-1234`);
    if (resourceResponse.ok) {
      const data = await resourceResponse.json();
      console.log(`   ✓ Retrieved ${data.logs.length} logs from server-1234`);
    }

    console.log('\n✅ API testing completed successfully!');

  } catch (error) {
    console.error('❌ API testing failed:', error.message);
  }
}

testAPI(); 