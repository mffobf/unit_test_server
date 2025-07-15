# unit_test_server/routes/api/tests.py (updated with middleware)
from flask import request, jsonify
from unit_test_server.test_discovery import discover_tests
from unit_test_server.runtime import (
    store_initial_test,
    get_next_test_id,
)
from unit_test_server.socket import socketio
from unit_test_server.middleware import redis_health_check, validate_json
from . import api_bp


@api_bp.route('/tests')
@redis_health_check()
# @rate_limit(max_requests=20, window_seconds=60)
def get_tests():
    """Get all available tests"""
    try:
        tests = discover_tests()
        return jsonify(tests)
    except Exception as e:
        return jsonify({'error': f'Failed to discover tests: {str(e)}'}), 500


@api_bp.route('/run-test', methods=['POST'])
@redis_health_check()
# @rate_limit(max_requests=20, window_seconds=60)
@validate_json()
def run_test():
    """Queue a test for execution"""
    from unit_test_server.tasks import run_test_task

    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400

        # Validate required parameters
        required_params = ['group', 'file', 'function']
        missing_params = [
            param for param in required_params if not data.get(param)]

        if missing_params:
            return jsonify({
                'error': f'Missing required parameters: {", ".join(missing_params)}'
            }), 400

        group, file, function = data['group'], data['file'], data['function']
        test_id = get_next_test_id()
        initial = store_initial_test(test_id, group, file, function)

        # Emit initial state via WebSocket
        socketio.emit('test_update', initial)

        # Queue the task
        task = run_test_task.delay(test_id, group, file, function)

        return jsonify({
            'test_id': test_id,
            'status': 'queued',
            'task_id': task.id
        })

    except Exception as e:
        return jsonify({'error': f'Failed to queue task: {str(e)}'}), 500
