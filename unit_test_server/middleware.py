# unit_test_server/middleware.py
from functools import wraps
from flask import request, jsonify, g
from unit_test_server.config import get_redis_client


def redis_health_check():
    """Check Redis health before processing requests"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            try:
                with get_redis_client() as redis_client:
                    redis_client.ping()
                return f(*args, **kwargs)
            except Exception as e:
                return jsonify({
                    'error': 'Redis service unavailable',
                    'details': str(e)
                }), 503

        return decorated_function
    return decorator


def rate_limit(max_requests=100, window_seconds=60):
    """Simple rate limiting based on IP address"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            client_ip = request.remote_addr
            key = f"rate_limit:{client_ip}"

            try:
                with get_redis_client() as redis_client:
                    current = redis_client.get(key)
                    if current is None:
                        redis_client.setex(key, window_seconds, 1)
                    else:
                        current = int(current)
                        if current >= max_requests:
                            return jsonify({
                                'error': 'Rate limit exceeded',
                                'retry_after': redis_client.ttl(key)
                            }), 429
                        redis_client.incr(key)

            except Exception as e:
                # Continue processing if rate limiting fails
                pass

            return f(*args, **kwargs)

        return decorated_function
    return decorator


def validate_json():
    """Validate JSON content for POST requests"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if request.method == 'POST':
                if not request.is_json:
                    return jsonify({'error': 'Content-Type must be application/json'}), 400

                try:
                    request.get_json(force=True)
                except Exception as e:
                    return jsonify({'error': f'Invalid JSON: {str(e)}'}), 400

            return f(*args, **kwargs)

        return decorated_function
    return decorator
