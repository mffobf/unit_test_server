# unit_test_server/routes/api/cache.py
from flask import jsonify
from unit_test_server.middleware import redis_health_check
from unit_test_server.config import get_redis_client
from . import api_bp


@api_bp.route('/clear-cache', methods=['POST'])
@redis_health_check()
def clear_cache():
    """Clear Redis cache"""
    try:
        with get_redis_client() as redis_client:
            redis_client.flushall()
        return jsonify({'message': 'Redis cache cleared successfully'}), 200
    except Exception as e:
        return jsonify({'error': f'Failed to clear cache: {str(e)}'}), 500
