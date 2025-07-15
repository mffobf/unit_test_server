# unit_test_server/routes/api/results.py
from flask import jsonify
from unit_test_server.middleware import redis_health_check
from unit_test_server.runtime import (
    get_all_test_results,
    get_test_result
)
from . import api_bp


@api_bp.route('/test-results')
@redis_health_check()
def get_test_results():
    """Get all test results"""
    try:
        results = get_all_test_results()
        return jsonify(results)
    except Exception as e:
        return jsonify({'error': f'Failed to get test results: {str(e)}'}), 500


@api_bp.route('/test-result/<test_id>')
@redis_health_check()
def get_single_test_result(test_id):
    """Get a specific test result by ID"""
    try:
        result = get_test_result(test_id)
        if result:
            return jsonify(result)
        return jsonify({'error': 'Test result not found'}), 404
    except Exception as e:
        return jsonify({'error': f'Failed to get test result: {str(e)}'}), 500
