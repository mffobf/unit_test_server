// Tab switching function
function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    // Remove active class from all buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected tab
    const tabElement = document.getElementById(tabName + '-tab');
    if (tabElement) {
        tabElement.classList.add('active');
    }

    // Update button styling for the clicked button
    const activeButton = document.querySelector(`[onclick="switchTab('${tabName}')"]`);
    if (activeButton) {
        activeButton.classList.add('active');
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

// Helper function to get status badge with enhanced styling
function getStatusBadge(status) {
    const statusIcons = {
        'passed': '<svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>',
        'failed': '<svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>',
        'running': '<svg class="w-3 h-3 animate-spin" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"></path></svg>',
        'completed': '<svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>'
    };

    const icon = statusIcons[status] || '';
    return `<div class="status-badge status-${status}">${icon}${status.charAt(0).toUpperCase() + status.slice(1)}</div>`;
}

// Safe access to nested object properties
function safeGet(obj, path, defaultValue = 'N/A') {
    return path.split('.').reduce((current, key) => {
        return current && current[key] !== undefined ? current[key] : defaultValue;
    }, obj);
}

// Enhanced test details function
function showTestDetails(id) {
    console.log('showTestDetails called with id:', id);

    // Check if testResults is available
    if (typeof testResults === 'undefined') {
        console.error('testResults is not defined');
        return;
    }

    console.log('Available test IDs:', Object.keys(testResults));

    const test = testResults[id];
    if (!test) {
        console.error('Test not found:', id);
        console.log('Available tests:', testResults);
        return;
    }

    console.log('Test data:', test);

    // Update modal title and status
    const titleElement = document.getElementById('modal-title');
    const statusElement = document.getElementById('modal-status-badge');

    if (titleElement) {
        titleElement.textContent = test.function || test.name || 'Unknown Test';
    }

    if (statusElement) {
        statusElement.innerHTML = getStatusBadge(test.result || test.status || 'unknown');
    }

    // Overview Tab Content with enhanced design
    const overviewContent = document.getElementById('overview-content');
    if (overviewContent) {
        overviewContent.innerHTML = `
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div class="metric-card">
                    <div class="metric-value text-gray-600">${test.duration || 0}s</div>
                    <div class="metric-label">Execution Time</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value text-gray-600">${safeGet(test, 'memory_summary.test_memory.peak_mb', 0)}MB</div>
                    <div class="metric-label">Peak Memory</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value text-gray-600">${safeGet(test, 'memory_summary.test_memory.efficiency', 0)}%</div>
                    <div class="metric-label">Efficiency</div>
                </div>
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div class="space-y-6">
                    <div>
                        <h3 class="text-lg font-semibold text-gray-900 mb-4">Test Information</h3>
                        <div class="space-y-3">
                            <div class="flex justify-between py-2 border-b border-gray-100">
                                <span class="text-gray-600">Group</span>
                                <span class="font-medium">${test.group || 'N/A'}</span>
                            </div>
                            <div class="flex justify-between py-2 border-b border-gray-100">
                                <span class="text-gray-600">File</span>
                                <span class="font-medium font-mono text-sm">${test.file || 'N/A'}</span>
                            </div>
                            <div class="flex justify-between py-2 border-b border-gray-100">
                                <span class="text-gray-600">Function</span>
                                <span class="font-medium font-mono text-sm">${test.function || test.name || 'N/A'}</span>
                            </div>
                            <div class="flex justify-between py-2">
                                <span class="text-gray-600">Status</span>
                                ${getStatusBadge(test.result || test.status || 'unknown')}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="space-y-6">
                    <div>
                        <h3 class="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h3>
                        <div class="space-y-3">
                            <div class="flex justify-between py-2 border-b border-gray-100">
                                <span class="text-gray-600">Test Duration</span>
                                <span class="font-medium">${test.duration || 0}s</span>
                            </div>
                            <div class="flex justify-between py-2 border-b border-gray-100">
                                <span class="text-gray-600">Task Duration</span>
                                <span class="font-medium">${test.task_duration || 0}s</span>
                            </div>
                            <div class="flex justify-between py-2 border-b border-gray-100">
                                <span class="text-gray-600">Memory Delta</span>
                                <span class="font-medium">${safeGet(test, 'memory_summary.test_memory.delta_mb', 0).toFixed ? safeGet(test, 'memory_summary.test_memory.delta_mb', 0).toFixed(2) : safeGet(test, 'memory_summary.test_memory.delta_mb', 0)} MB</span>
                            </div>
                            <div class="flex justify-between py-2">
                                <span class="text-gray-600">Memory Stability</span>
                                <span class="font-medium">${safeGet(test, 'memory_summary.test_memory.stability', 0)}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Memory Tab Content with enhanced visualization
    const memoryContent = document.getElementById('memory-content');
    if (memoryContent) {
        memoryContent.innerHTML = `
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div class="metric-card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <h3 class="text-lg font-semibold text-blue-900 mb-4">Test Memory Usage</h3>
                    <div class="space-y-3">
                        <div class="flex justify-between">
                            <span class="text-blue-700">Peak Memory</span>
                            <span class="font-bold text-blue-900">${safeGet(test, 'memory_summary.test_memory.peak_mb', 0)} MB</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-blue-700">Memory Delta</span>
                            <span class="font-bold text-blue-900">${safeGet(test, 'memory_summary.test_memory.delta_mb', 0)} MB</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-blue-700">Efficiency</span>
                            <span class="font-bold text-blue-900">${safeGet(test, 'memory_summary.test_memory.efficiency', 0)}%</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-blue-700">Stability</span>
                            <span class="font-bold text-blue-900">${safeGet(test, 'memory_summary.test_memory.stability', 0)}%</span>
                        </div>
                    </div>
                </div>
                
                <div class="metric-card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <h3 class="text-lg font-semibold text-green-900 mb-4">Task Memory Usage</h3>
                    <div class="space-y-3">
                        <div class="flex justify-between">
                            <span class="text-green-700">Peak Memory</span>
                            <span class="font-bold text-green-900">${safeGet(test, 'memory_summary.task_memory.peak_mb', 0)} MB</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-green-700">Memory Delta</span>
                            <span class="font-bold text-green-900">${safeGet(test, 'memory_summary.task_memory.delta_mb', 0)} MB</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="metric-card">
                <h3 class="text-lg font-semibold text-gray-900 mb-6">Detailed Memory Statistics</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 class="font-medium text-gray-700 mb-3">RSS Memory Stats</h4>
                        <div class="space-y-2">
                            <div class="flex justify-between">
                                <span class="text-gray-600">Peak</span>
                                <span class="font-medium">${formatBytes(safeGet(test, 'resource_usage.memory_stats.rss_stats.peak', 0))}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">Average</span>
                                <span class="font-medium">${formatBytes(safeGet(test, 'resource_usage.memory_stats.rss_stats.average', 0))}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">Delta</span>
                                <span class="font-medium">${formatBytes(safeGet(test, 'resource_usage.memory_stats.rss_stats.delta', 0))}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <h4 class="font-medium text-gray-700 mb-3">Tracemalloc Stats</h4>
                        <div class="space-y-2">
                            <div class="flex justify-between">
                                <span class="text-gray-600">Peak</span>
                                <span class="font-medium">${formatBytes(safeGet(test, 'resource_usage.memory_stats.tracemalloc.peak_bytes', 0))}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">Current</span>
                                <span class="font-medium">${formatBytes(safeGet(test, 'resource_usage.memory_stats.tracemalloc.current_bytes', 0))}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">Samples</span>
                                <span class="font-medium">${safeGet(test, 'resource_usage.memory_stats.samples_count', 0)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Output Tab Content
    const outputContent = document.getElementById('output-content');
    if (outputContent) {
        outputContent.innerHTML = `
            <div class="space-y-6">
                ${test.output ? `
                    <div>
                        <h3 class="text-lg font-semibold text-gray-900 mb-4">Test Output</h3>
                        <div class="code-block">
                            <pre class="whitespace-pre-wrap">${test.output}</pre>
                        </div>
                    </div>
                ` : ''}
                
                ${test.error ? `
                    <div>
                        <h3 class="text-lg font-semibold text-red-900 mb-4">Error Details</h3>
                        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                            <pre class="text-red-800 whitespace-pre-wrap font-mono text-sm">${test.error}</pre>
                        </div>
                    </div>
                ` : ''}
                
                ${!test.output && !test.error ? `
                    <div class="text-center py-12">
                        <svg class="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 class="text-lg font-medium text-gray-900 mb-2">No Output Available</h3>
                        <p class="text-gray-500">No output or error information was captured for this test.</p>
                    </div>
                ` : ''}
            </div>
        `;
    }

    // Details Tab Content
    const detailsContent = document.getElementById('details-content');
    if (detailsContent) {
        detailsContent.innerHTML = `
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div class="metric-card">
                    <h3 class="text-lg font-semibold text-gray-900 mb-4">Execution Timeline</h3>
                    <div class="space-y-3">
                        <div class="flex justify-between py-2 border-b border-gray-100">
                            <span class="text-gray-600">Created</span>
                            <span class="font-medium">${test.created_at ? new Date(test.created_at * 1000).toLocaleString() : 'N/A'}</span>
                        </div>
                        <div class="flex justify-between py-2 border-b border-gray-100">
                            <span class="text-gray-600">Started</span>
                            <span class="font-medium">${test.started_at ? new Date(test.started_at * 1000).toLocaleString() : 'N/A'}</span>
                        </div>
                        <div class="flex justify-between py-2 border-b border-gray-100">
                            <span class="text-gray-600">Completed</span>
                            <span class="font-medium">${test.completed_at ? new Date(test.completed_at * 1000).toLocaleString() : 'N/A'}</span>
                        </div>
                        <div class="flex justify-between py-2">
                            <span class="text-gray-600">Total Duration</span>
                            <span class="font-medium">${test.task_duration || 0}s</span>
                        </div>
                    </div>
                </div>
                
                <div class="metric-card">
                    <h3 class="text-lg font-semibold text-gray-900 mb-4">Worker Information</h3>
                    <div class="space-y-3">
                        <div class="flex justify-between py-2 border-b border-gray-100">
                            <span class="text-gray-600">Worker ID</span>
                            <span class="font-medium font-mono text-sm">${test.worker_id || 'N/A'}</span>
                        </div>
                        <div class="flex justify-between py-2 border-b border-gray-100">
                            <span class="text-gray-600">Process ID</span>
                            <span class="font-medium">${test.worker_pid || 'N/A'}</span>
                        </div>
                        <div class="flex justify-between py-2">
                            <span class="text-gray-600">Initial Memory</span>
                            <span class="font-medium">${formatBytes(test.worker_memory_initial || 0)}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Reset to overview tab
    switchTab('overview');
    openModal();
}

// Modal control functions
function openModal() {
    const modal = document.getElementById('test-modal');
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // Prevent body scrolling
    }
}

function closeModal() {
    const modal = document.getElementById('test-modal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = ''; // Restore body scrolling
    }
}

// Setup modal event handlers
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('test-modal');
  if (!modal) return;

  // outside-click + ESC handlers
  modal.addEventListener('click', e => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      closeModal();
    }
  });
});