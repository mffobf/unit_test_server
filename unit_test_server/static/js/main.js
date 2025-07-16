// static/js/main.js

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
	console.log('Test Runner initialized');

	// Load initial data
	loadTests();
	loadTestResults();

	// Setup modal event handlers
	document.addEventListener('DOMContentLoaded', function () {
		const modal = document.getElementById('test-modal');
		if (modal) {
			// Close modal when clicking outside
			modal.addEventListener('click', function (e) {
				if (e.target === modal) {
					closeModal();
				}
			});

			// Close modal on escape key
			document.addEventListener('keydown', function (e) {
				if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
					closeModal();
				}
			});
		}
	});

	// Setup periodic refresh for test results
	setInterval(function () {
		loadTestResults();
	}, 5000); // Refresh every 5 seconds

	console.log('Application setup complete');
});