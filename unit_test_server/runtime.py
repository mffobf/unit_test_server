# unit_test_server/runtime.py
import json
import time
from typing import Optional, Dict, Any, List
from unit_test_server.config import get_redis_client, redis_manager

TEST_RESULTS_KEY = 'test_results'
COUNTER_KEY = 'test_counter'
HEALTH_CHECK_KEY = 'health_check'
socketio = None


def set_socketio(io):
    global socketio
    socketio = io


def get_next_test_id() -> str:
    """Get next test ID with Redis failover handling"""
    try:
        with get_redis_client() as redis_client:
            next_id = redis_client.incr(COUNTER_KEY)
            return f"test_{next_id}"
    except Exception:
        # Fallback to timestamp-based ID
        import time
        return f"test_fallback_{int(time.time())}"


def store_initial_test(test_id: str, group: str, file: str, function: str) -> Dict[str, Any]:
    """Store initial test data with error handling"""
    import time
    data = {
        'id': test_id,
        'group': group,
        'file': file,
        'function': function,
        'status': 'running',
        'result': None,
        'output': '',
        'error': None,
        'duration': None,
        'created_at': time.time()
    }

    try:
        with get_redis_client() as redis_client:
            redis_client.hset(TEST_RESULTS_KEY, test_id, json.dumps(data))
    except Exception:
        # Continue execution - data will be stored when test completes
        pass

    return data


def update_test_result(test_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Update test result with comprehensive error handling"""
    import time
    try:
        with get_redis_client() as redis_client:
            raw = redis_client.hget(TEST_RESULTS_KEY, test_id)
            if not raw:
                return None

            data = json.loads(raw)
            data.update(updates)
            data['updated_at'] = time.time()

            # Store updated data
            redis_client.hset(TEST_RESULTS_KEY, test_id, json.dumps(data))

            # Emit socket update if available
            if socketio:
                try:
                    socketio.emit('test_update', data)
                except Exception:
                    pass

            return data

    except Exception:
        return None


def get_all_test_results() -> List[Dict[str, Any]]:
    """Get all test results with error handling"""
    try:
        with get_redis_client() as redis_client:
            raw_results = redis_client.hvals(TEST_RESULTS_KEY)
            results = []

            for raw in raw_results:
                try:
                    results.append(json.loads(raw))
                except json.JSONDecodeError:
                    continue

            return results
    except Exception:
        return []


def get_test_result(test_id: str) -> Optional[Dict[str, Any]]:
    """Get specific test result"""
    try:
        with get_redis_client() as redis_client:
            raw = redis_client.hget(TEST_RESULTS_KEY, test_id)
            if raw:
                return json.loads(raw)
    except Exception:
        pass
    return None


def get_redis_health_info():
    """Get Redis health information"""
    try:
        redis_client = redis_manager.get_client()

        # Test connection
        ping_result = redis_client.ping()

        # Get basic info
        redis_info = redis_client.info()

        return {
            'status': 'healthy',
            'ping': ping_result,
            'redis_version': redis_info.get('redis_version'),
            'connected_clients': redis_info.get('connected_clients'),
            'used_memory_human': redis_info.get('used_memory_human'),
            'uptime_in_seconds': redis_info.get('uptime_in_seconds'),
            'timestamp': time.time()
        }
    except Exception as e:
        return {
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': time.time()
        }
