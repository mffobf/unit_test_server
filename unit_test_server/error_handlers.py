# unit_test_server/error_handlers.py
from flask import jsonify, request
from redis.exceptions import ConnectionError, TimeoutError
from celery.exceptions import WorkerLostError


def register_error_handlers(app):
    """Register global error handlers"""

    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({
            'error': 'Bad Request',
            'message': error.description,
            'status_code': 400
        }), 400

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            'error': 'Not Found',
            'message': f'Endpoint {request.path} not found',
            'status_code': 404
        }), 404

    @app.errorhandler(405)
    def method_not_allowed(error):
        return jsonify({
            'error': 'Method Not Allowed',
            'message': f'Method {request.method} not allowed for {request.path}',
            'status_code': 405
        }), 405

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({
            'error': 'Internal Server Error',
            'message': 'An unexpected error occurred',
            'status_code': 500
        }), 500

    @app.errorhandler(ConnectionError)
    def redis_connection_error(error):
        return jsonify({
            'error': 'Database Connection Error',
            'message': 'Unable to connect to Redis',
            'status_code': 503
        }), 503

    @app.errorhandler(TimeoutError)
    def redis_timeout_error(error):
        return jsonify({
            'error': 'Database Timeout',
            'message': 'Redis operation timed out',
            'status_code': 504
        }), 504

    @app.errorhandler(WorkerLostError)
    def celery_worker_lost(error):
        return jsonify({
            'error': 'Worker Error',
            'message': 'Task worker is unavailable',
            'status_code': 503
        }), 503
