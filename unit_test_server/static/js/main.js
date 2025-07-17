// static/js/main.js

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
  console.log('Test Runner initialized');

  // Load initial data
  loadTests();
  loadTestResults();

  // Setup periodic refresh for test results
  setInterval(function () {
    loadTestResults();
  }, 5000); // Refresh every 5 seconds

  console.log('Application setup complete');
});
