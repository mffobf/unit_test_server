// static/js/api.js

// State management
let allTests = {};
let testResults = {};

// Fetch and cache available tests
async function loadTests() {
  try {
    const response = await fetch('/api/tests');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    allTests = await response.json();
    displayTests();
  } catch (error) {
    console.error('Error loading tests:', error);
    showToast('Failed to load tests', 'error');
  }
}

// Fetch and cache test results
async function loadTestResults() {
  try {
    const response = await fetch('/api/test-results');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const results = await response.json();

    // Reset and populate results
    testResults = {};
    results.forEach(result => {
      testResults[result.id] = result;
    });

    updateResultsTable();
    updateStats();
  } catch (error) {
    console.error('Failed to load test results:', error);
    showToast('Failed to load test results', 'error');
  }
}

// Queue a single test for execution
async function runTest(group, file, func) {
  try {
    const response = await fetch('/api/run-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ group, file, function: func })
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const result = await response.json();

    if (result.error) {
      console.error('Error running test:', result.error);
      showToast(`Error: ${result.error}`, 'error');
    } else {
      console.log('Test queued:', result.test_id);
    }
  } catch (error) {
    console.error('Error running test:', error);
    showToast('Failed to queue test', 'error');
  }
}

// Trigger redis-based test discovery refresh
function updateTests() {
  loadTests();
  showToast('Test list updated', 'info');
}

// Flush Redis cache via your backend
async function clearCache() {
  try {
    const res = await fetch('/api/clear-cache', { method: 'POST' });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    showToast('Cache cleared', 'info');
    // give the toast a moment, then reload
    setTimeout(() => window.location.reload(), 500);
  } catch (err) {
    console.error('Clear cache failed', err);
    showToast('Failed to clear cache', 'error');
  }
}
