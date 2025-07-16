// static/js/ui.js

// Build the available tests grid with shadcn/ui styling and expandable functionality
function displayTests() {
  const container = document.getElementById('tests-container');
  if (!container) return;

  container.innerHTML = '';

  for (const [group, files] of Object.entries(allTests)) {
    const card = document.createElement('div');
    card.className = 'test-card rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow';

    let html = `
      <div class="flex flex-col space-y-1.5 p-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2 cursor-pointer min-w-0" onclick="toggleTestCard('${group}')">
            <svg class="h-5 w-5 text-muted-foreground transition-transform duration-200 expand-icon flex-shrink-0" 
                 id="expand-icon-${group}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
            <svg class="h-5 w-5 text-muted-foreground flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 1v4m8-4v4" />
            </svg>
            <h3 class="text-lg font-semibold leading-none tracking-tight truncate">${group}</h3>
          </div>
          <div class="flex items-center space-x-2 flex-shrink-0">
            <span class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
              ${Object.keys(files).length} files
            </span>
            <button onclick="runGroupTests('${group}')" 
                    class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-8 px-3 py-1">
              <svg class="mr-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Run Group
            </button>
          </div>
        </div>
        <p class="text-sm text-muted-foreground cursor-pointer" onclick="toggleTestCard('${group}')">
          Test group with ${Object.values(files).reduce((sum, funcs) => sum + funcs.length, 0)} test functions
        </p>
      </div>
      <div class="test-card-content overflow-hidden transition-all duration-300 ease-in-out" 
           id="card-content-${group}" style="max-height: 0; opacity: 0;">
        <div class="p-6 pt-0 space-y-4 min-w-0">`;

    for (const [file, functions] of Object.entries(files)) {
      html += `
        <div class="rounded-md border bg-muted/50 p-4 space-y-3 min-w-0">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div class="flex items-center space-x-2 min-w-0">
              <svg class="h-4 w-4 text-muted-foreground flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span class="text-sm font-medium truncate">${file}</span>
              <span class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 flex-shrink-0">
                ${functions.length} tests
              </span>
            </div>
            <button onclick="runFileTests('${group}', '${file}')" 
                    class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-8 px-3 py-1 w-full sm:w-auto">
              <svg class="mr-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Run File
            </button>
          </div>
          <div class="grid gap-2">`;

      functions.forEach(func => {
        const testId = `${group}-${file}-${func}`;
        const testResult = testResults[testId];
        const statusClass = getStatusClass(testResult?.result || testResult?.status);
        const statusIcon = getStatusIcon(testResult?.result || testResult?.status);

        html += `
          <button onclick="runTest('${group}','${file}','${func}')"
                  class="test-function-btn flex items-center justify-between w-full text-left px-3 py-2 text-sm border rounded-md transition-all hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring group min-w-0"
                  data-test-id="${testId}">
            <div class="flex items-center space-x-2 min-w-0">
              <svg class="h-3 w-3 text-muted-foreground group-hover:text-accent-foreground transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
              <span class="font-mono text-xs truncate">${func}</span>
            </div>
            <div class="flex items-center space-x-2 flex-shrink-0">
              ${testResult?.duration ? `<span class="text-xs text-muted-foreground">${testResult.duration}s</span>` : ''}
              <div class="test-status-indicator ${statusClass}" title="${testResult?.result || 'Not run'}">
                ${statusIcon}
              </div>
            </div>
          </button>`;
      });

      html += `</div></div>`;
    }

    html += `</div></div>`;
    card.innerHTML = html;
    container.appendChild(card);
  }
}

// Toggle function for expanding/collapsing test cards
function toggleTestCard(groupName) {
  const content = document.getElementById(`card-content-${groupName}`);
  const icon = document.getElementById(`expand-icon-${groupName}`);

  if (!content || !icon) return;

  const isExpanded = content.style.maxHeight && content.style.maxHeight !== '0px';

  if (isExpanded) {
    // Collapse
    content.style.maxHeight = '0px';
    content.style.opacity = '0';
    icon.style.transform = 'rotate(0deg)';
  } else {
    // Expand
    content.style.maxHeight = content.scrollHeight + 'px';
    content.style.opacity = '1';
    icon.style.transform = 'rotate(90deg)';
  }
}

// Optional: Add keyboard support for accessibility
document.addEventListener('keydown', function (e) {
  if (e.key === 'Enter' || e.key === ' ') {
    const target = e.target.closest('[onclick^="toggleTestCard"]');
    if (target) {
      e.preventDefault();
      const groupName = target.getAttribute('onclick').match(/'([^']+)'/)[1];
      toggleTestCard(groupName);
    }
  }
});

// Initialize cards in collapsed state (optional)
document.addEventListener('DOMContentLoaded', function () {
  // You can call displayTests() here if it's not already being called
  // displayTests();
});

// Helper function to get status class for styling
function getStatusClass(status) {
  switch (status) {
    case 'passed':
      return 'text-green-600';
    case 'failed':
      return 'text-red-600';
    case 'running':
      return 'text-yellow-600 animate-pulse';
    case 'file_not_found':
      return 'text-gray-600';
    default:
      return 'text-gray-400';
  }
}

// Helper function to get status icon
function getStatusIcon(status) {
  switch (status) {
    case 'passed':
      return `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>`;
    case 'failed':
      return `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>`;
    case 'running':
      return `<svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>`;
    case 'file_not_found':
      return `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>`;
    default:
      return `<div class="w-2 h-2 rounded-full bg-gray-300"></div>`;
  }
}

// Run all tests in a specific group
async function runGroupTests(group) {
  if (!allTests[group]) return;
  let queued = 0;
  for (const [file, funcs] of Object.entries(allTests[group])) {
    for (const func of funcs) {
      await runTest(group, file, func);
      queued++;
    }
  }
  showToast(`Queued ${queued} tests in ${group}`, 'info');
}

// Run all tests in a specific file
async function runFileTests(group, file) {
  if (!allTests[group] || !allTests[group][file]) return;
  let queued = 0;
  for (const func of allTests[group][file]) {
    await runTest(group, file, func);
    queued++;
  }
  showToast(`Queued ${queued} tests in ${file}`, 'info');
}

// Run all tests across all groups and files
async function runAllTests() {
  let queued = 0;
  for (const [group, files] of Object.entries(allTests)) {
    for (const [file, funcs] of Object.entries(files)) {
      for (const func of funcs) {
        await runTest(group, file, func);
        queued++;
      }
    }
  }
  showToast(`Queued ${queued} tests`, 'info');
}

// Update a single test's status
function updateTestResult(data) {
  testResults[data.id] = { ...testResults[data.id], ...data };
  updateResultsTable();
  updateStats();
  updateTestIndicators();
}

// Update test status indicators in the test cards
function updateTestIndicators() {
  Object.values(testResults).forEach(result => {
    const testId = `${result.group}-${result.file}-${result.function}`;
    const indicator = document.querySelector(`[data-test-id="${testId}"] .test-status-indicator`);
    if (indicator) {
      indicator.className = `test-status-indicator ${getStatusClass(result.result || result.status)}`;
      indicator.innerHTML = getStatusIcon(result.result || result.status);
      indicator.title = result.result || result.status || 'Not run';
    }
  });
}

// Re-render the results table with shadcn/ui styling
// Enhanced updateResultsTable function with mobile support
function updateResultsTable() {
  const tbody = document.getElementById('results-table');
  const mobileContainer = document.getElementById('results-mobile');

  if (!tbody || !mobileContainer) return;

  // Clear both containers
  tbody.innerHTML = '';
  mobileContainer.innerHTML = '';

  const sortedResults = Object.values(testResults).sort((a, b) => {
    // Sort by group, then file, then function
    if (a.group !== b.group) return a.group.localeCompare(b.group);
    if (a.file !== b.file) return a.file.localeCompare(b.file);
    return a.function.localeCompare(b.function);
  });

  sortedResults.forEach(result => {
    const statusBadge = getStatusBadge(result.result || result.status);
    const durationDisplay = result.duration ? `${result.duration}s` : '-';

    // Desktop table row
    const row = document.createElement('tr');
    row.className = 'border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted';

    if (result.status === 'running') {
      row.classList.add('status-running');
    }

    row.innerHTML = `
      <td class="p-4 align-middle [&:has([role=checkbox])]:pr-0">
        <div class="space-y-1">
          <div class="text-sm font-medium leading-none">${result.function}</div>
          <div class="text-xs text-muted-foreground font-mono">${result.group}/${result.file}</div>
        </div>
      </td>
      <td class="p-4 align-middle [&:has([role=checkbox])]:pr-0">
        ${statusBadge}
      </td>
      <td class="p-4 align-middle [&:has([role=checkbox])]:pr-0">
        <div class="text-sm text-muted-foreground">${durationDisplay}</div>
      </td>
      <td class="p-4 align-middle [&:has([role=checkbox])]:pr-0">
        <button onclick="showTestDetails('${result.id}')" 
                class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
          <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          View
        </button>
      </td>`;

    tbody.appendChild(row);

    // Mobile card
    const card = document.createElement('div');
    card.className = 'rounded-lg border bg-card p-4 space-y-3 transition-colors hover:bg-muted/50';

    if (result.status === 'running') {
      card.classList.add('status-running');
    }

    card.innerHTML = `
      <div class="flex items-start justify-between gap-3">
        <div class="flex-1 min-w-0">
          <div class="text-sm font-medium truncate">${result.function}</div>
          <div class="text-xs text-muted-foreground font-mono mt-1 truncate">${result.group}/${result.file}</div>
        </div>
        <div class="flex-shrink-0">
          ${statusBadge}
        </div>
      </div>
      
      <div class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-2 text-xs text-muted-foreground">
          <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12,6 12,12 16,14"/>
          </svg>
          Duration: ${durationDisplay}
        </div>
        <button onclick="showTestDetails('${result.id}')" 
                class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-8 px-3 py-1 text-xs">
          <svg class="mr-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          View
        </button>
      </div>`;

    mobileContainer.appendChild(card);
  });

  if (window.applyFilter) window.applyFilter();
}

// Get status badge HTML
function getStatusBadge(status) {
  switch (status) {
    case 'passed':
      return `<span class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-green-100 text-green-800 hover:bg-green-100/80">
                <svg class="mr-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                Passed
              </span>`;
    case 'failed':
      return `<span class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-red-100 text-red-800 hover:bg-red-100/80">
                <svg class="mr-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Failed
              </span>`;
    case 'running':
      return `<span class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80">
                <svg class="mr-1 h-3 w-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Running
              </span>`;
    case 'file_not_found':
      return `<span class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-gray-100 text-gray-800 hover:bg-gray-100/80">
                <svg class="mr-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                Missing
              </span>`;
    default:
      return `<span class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-gray-100 text-gray-800 hover:bg-gray-100/80">
                <div class="mr-1 w-2 h-2 rounded-full bg-gray-400"></div>
                Pending
              </span>`;
  }
}

// Update the counters with animations
function updateStats() {
  const values = Object.values(testResults);

  animateCounter('total-tests', values.length);
  animateCounter('passed-tests', values.filter(r => r.result === 'passed').length);
  animateCounter('failed-tests', values.filter(r => r.result === 'failed').length);
  animateCounter('running-tests', values.filter(r => r.status === 'running').length);
  animateCounter('missing-tests', values.filter(r => r.result === 'file_not_found').length);
}

// Animate counter changes
function animateCounter(elementId, newValue) {
  const element = document.getElementById(elementId);
  if (!element) return;

  const currentValue = parseInt(element.textContent) || 0;
  if (currentValue === newValue) return;

  element.style.transform = 'scale(1.1)';
  element.style.transition = 'transform 0.2s ease-in-out';

  setTimeout(() => {
    element.textContent = newValue;
    element.style.transform = 'scale(1)';
  }, 100);
}

