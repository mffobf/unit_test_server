// static/js/socket.js

// Initialize Socket.IO connection and handle real-time events
const socket = io();

// Connection event handlers
socket.on('connect', function () {
  console.log('Connected to server via WebSocket');
});

socket.on('disconnect', function () {
  console.log('Disconnected from server');
});

socket.on('connect_error', function (error) {
  console.error('Connection error:', error);
});

// Test update event handlers
socket.on('test_update', (data) => {
  updateTestResult(data);
  if (data.result === 'failed') {
    showToast(`${data.function} failed`, 'error');
  } else if (data.result === 'file_not_found') {
    showToast(`${data.function} not found`, 'warning');
  }
});