// Tab switching function
function switchTab(tabName) {
  // Hide all tabs
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });

  // Remove active class from all buttons
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.classList.remove('active', 'border-blue-500', 'text-blue-600');
    btn.classList.add('border-transparent', 'text-gray-500');
  });

  // Show selected tab
  document.getElementById(tabName + '-tab').classList.add('active');

  // Update button styling for the clicked button
  const activeButton = document.querySelector(`[onclick="switchTab('${tabName}')"]`);
  if (activeButton) {
    activeButton.classList.add('active', 'border-blue-500', 'text-blue-600');
    activeButton.classList.remove('border-transparent', 'text-gray-500');
  }
}

// Helper function to format bytes
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Helper function to get status badge
function getStatusBadge(status) {
  const badges = {
    'passed': '<span class="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Passed</span>',
    'failed': '<span class="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Failed</span>',
    'running': '<span class="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Running</span>',
    'completed': '<span class="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Completed</span>'
  };
  return badges[status] || `<span class="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">${status}</span>`;
}

// Enhanced test details function
function showTestDetails(id) {
  const test = testResults[id];
  if (!test) return;

  document.getElementById('modal-title').textContent = `${test.function}`;

  // Overview Tab Content
  const overviewContent = document.getElementById('overview-content');
  overviewContent.innerHTML = `
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-4">
                        <h4 class="text-sm font-medium text-gray-900">Test Information</h4>
                        <div class="bg-gray-50 rounded-lg p-4 space-y-3">
                            <div class="flex justify-between">
                                <span class="text-sm text-gray-600">Group:</span>
                                <span class="text-sm font-medium">${test.group}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-sm text-gray-600">File:</span>
                                <span class="text-sm font-medium">${test.file}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-sm text-gray-600">Function:</span>
                                <span class="text-sm font-medium">${test.function}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-sm text-gray-600">Status:</span>
                                ${getStatusBadge(test.result || test.status)}
                            </div>
                        </div>
                    </div>
                    <div class="space-y-4">
                        <h4 class="text-sm font-medium text-gray-900">Performance Summary</h4>
                        <div class="bg-gray-50 rounded-lg p-4 space-y-3">
                            <div class="flex justify-between">
                                <span class="text-sm text-gray-600">Duration:</span>
                                <span class="text-sm font-medium">${test.duration}s</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-sm text-gray-600">Peak Memory:</span>
                                <span class="text-sm font-medium">${test.memory_summary.test_memory.peak_mb.toFixed(2)} MB</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-sm text-gray-600">Memory Efficiency:</span>
                                <span class="text-sm font-medium">${test.memory_summary.test_memory.efficiency}%</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-sm text-gray-600">Memory Stability:</span>
                                <span class="text-sm font-medium">${test.memory_summary.test_memory.stability}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;

  // Memory Tab Content
  const memoryContent = document.getElementById('memory-content');
  memoryContent.innerHTML = `
                <div class="space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="space-y-4">
                            <h4 class="text-sm font-medium text-gray-900">Test Memory Usage</h4>
                            <div class="bg-blue-50 rounded-lg p-4 space-y-3">
                                <div class="flex justify-between">
                                    <span class="text-sm text-gray-600">Peak Memory:</span>
                                    <span class="text-sm font-medium">${test.memory_summary.test_memory.peak_mb.toFixed(2)} MB</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-sm text-gray-600">Memory Delta:</span>
                                    <span class="text-sm font-medium">${test.memory_summary.test_memory.delta_mb.toFixed(2)} MB</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-sm text-gray-600">Efficiency:</span>
                                    <span class="text-sm font-medium">${test.memory_summary.test_memory.efficiency}%</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-sm text-gray-600">Stability:</span>
                                    <span class="text-sm font-medium">${test.memory_summary.test_memory.stability}%</span>
                                </div>
                            </div>
                        </div>
                        <div class="space-y-4">
                            <h4 class="text-sm font-medium text-gray-900">Task Memory Usage</h4>
                            <div class="bg-green-50 rounded-lg p-4 space-y-3">
                                <div class="flex justify-between">
                                    <span class="text-sm text-gray-600">Peak Memory:</span>
                                    <span class="text-sm font-medium">${test.memory_summary.task_memory.peak_mb.toFixed(2)} MB</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-sm text-gray-600">Memory Delta:</span>
                                    <span class="text-sm font-medium">${test.memory_summary.task_memory.delta_mb.toFixed(2)} MB</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="space-y-4">
                        <h4 class="text-sm font-medium text-gray-900">Detailed Memory Statistics</h4>
                        <div class="bg-gray-50 rounded-lg p-4">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div class="space-y-2">
                                    <h5 class="text-xs font-medium text-gray-700 uppercase">RSS Stats</h5>
                                    <div class="text-sm space-y-1">
                                        <div class="flex justify-between">
                                            <span class="text-gray-600">Peak:</span>
                                            <span class="font-medium">${formatBytes(test.resource_usage.memory_stats.rss_stats.peak)}</span>
                                        </div>
                                        <div class="flex justify-between">
                                            <span class="text-gray-600">Average:</span>
                                            <span class="font-medium">${formatBytes(test.resource_usage.memory_stats.rss_stats.average)}</span>
                                        </div>
                                        <div class="flex justify-between">
                                            <span class="text-gray-600">Delta:</span>
                                            <span class="font-medium">${formatBytes(test.resource_usage.memory_stats.rss_stats.delta)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="space-y-2">
                                    <h5 class="text-xs font-medium text-gray-700 uppercase">Tracemalloc</h5>
                                    <div class="text-sm space-y-1">
                                        <div class="flex justify-between">
                                            <span class="text-gray-600">Peak:</span>
                                            <span class="font-medium">${formatBytes(test.resource_usage.memory_stats.tracemalloc.peak_bytes)}</span>
                                        </div>
                                        <div class="flex justify-between">
                                            <span class="text-gray-600">Current:</span>
                                            <span class="font-medium">${formatBytes(test.resource_usage.memory_stats.tracemalloc.current_bytes)}</span>
                                        </div>
                                        <div class="flex justify-between">
                                            <span class="text-gray-600">Samples:</span>
                                            <span class="font-medium">${test.resource_usage.memory_stats.samples_count}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

  // Output Tab Content
  const outputContent = document.getElementById('output-content');
  outputContent.innerHTML = `
                <div class="space-y-4">
                    ${test.output ? `
                        <div class="space-y-2">
                            <h4 class="text-sm font-medium text-gray-900">Test Output</h4>
                            <div class="rounded-lg border bg-gray-50 p-4">
                                <pre class="text-sm text-gray-800 whitespace-pre-wrap font-mono overflow-x-auto">${test.output}</pre>
                            </div>
                        </div>
                    ` : ''}
                    
                    ${test.error ? `
                        <div class="space-y-2">
                            <h4 class="text-sm font-medium text-gray-900">Error Details</h4>
                            <div class="rounded-lg border border-red-200 bg-red-50 p-4">
                                <pre class="text-sm text-red-700 whitespace-pre-wrap font-mono overflow-x-auto">${test.error}</pre>
                            </div>
                        </div>
                    ` : ''}
                    
                    ${!test.output && !test.error ? `
                        <div class="flex items-center justify-center py-8 text-gray-500">
                            <div class="text-center">
                                <svg class="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <p class="text-sm">No output or error information available</p>
                            </div>
                        </div>
                    ` : ''}
                </div>
            `;

  // Details Tab Content
  const detailsContent = document.getElementById('details-content');
  detailsContent.innerHTML = `
                <div class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="space-y-4">
                            <h4 class="text-sm font-medium text-gray-900">Execution Timeline</h4>
                            <div class="bg-gray-50 rounded-lg p-4 space-y-3">
                                <div class="flex justify-between">
                                    <span class="text-sm text-gray-600">Created:</span>
                                    <span class="text-sm font-medium">${new Date(test.created_at * 1000).toLocaleString()}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-sm text-gray-600">Started:</span>
                                    <span class="text-sm font-medium">${new Date(test.started_at * 1000).toLocaleString()}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-sm text-gray-600">Completed:</span>
                                    <span class="text-sm font-medium">${new Date(test.completed_at * 1000).toLocaleString()}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-sm text-gray-600">Task Duration:</span>
                                    <span class="text-sm font-medium">${test.task_duration}s</span>
                                </div>
                            </div>
                        </div>
                        <div class="space-y-4">
                            <h4 class="text-sm font-medium text-gray-900">Worker Information</h4>
                            <div class="bg-gray-50 rounded-lg p-4 space-y-3">
                                <div class="flex justify-between">
                                    <span class="text-sm text-gray-600">Worker ID:</span>
                                    <span class="text-sm font-medium">${test.worker_id}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-sm text-gray-600">Worker PID:</span>
                                    <span class="text-sm font-medium">${test.worker_pid}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-sm text-gray-600">Initial Memory:</span>
                                    <span class="text-sm font-medium">${formatBytes(test.worker_memory_initial)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

  // Reset to overview tab
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.classList.remove('active', 'border-blue-500', 'text-blue-600');
    btn.classList.add('border-transparent', 'text-gray-500');
  });

  // Activate overview tab
  document.getElementById('overview-tab').classList.add('active');
  const overviewButton = document.querySelector(`[onclick="switchTab('overview')"]`);
  if (overviewButton) {
    overviewButton.classList.add('active', 'border-blue-500', 'text-blue-600');
    overviewButton.classList.remove('border-transparent', 'text-gray-500');
  }

  document.getElementById('test-modal').classList.remove('hidden');
}

// Close modal function
function closeModal() {
  const modal = document.getElementById('test-modal');
  if (modal) {
    modal.classList.add('hidden');
  }
}