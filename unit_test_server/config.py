# unit_test_server/config.py
import os
from redis import Redis, ConnectionPool
from redis.sentinel import Sentinel
from redis.exceptions import ConnectionError, TimeoutError
from contextlib import contextmanager
import time
from typing import Optional, Dict, Any

# Absolute path where tests live
TESTS_PATH = os.path.abspath(
    os.environ.get('TESTS_PATH',
                   os.path.join(os.path.dirname(__file__), 'tests')))

# Redis Configuration
REDIS_URL = os.getenv("REDIS_URL")
REDIS_HOST = os.getenv("REDIS_HOST", "redis")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
REDIS_DB = int(os.getenv("REDIS_DB", 0))
REDIS_PASSWORD = os.getenv("REDIS_PASSWORD", None)

# Redis Sentinel Configuration (for high availability)
REDIS_SENTINELS = os.getenv("REDIS_SENTINELS", "").split(
    ",") if os.getenv("REDIS_SENTINELS") else []
REDIS_SENTINEL_SERVICE = os.getenv("REDIS_SENTINEL_SERVICE", "mymaster")

# Connection Pool Configuration
REDIS_MAX_CONNECTIONS = int(os.getenv("REDIS_MAX_CONNECTIONS", 50))
REDIS_SOCKET_TIMEOUT = float(os.getenv("REDIS_SOCKET_TIMEOUT", 5.0))
REDIS_SOCKET_CONNECT_TIMEOUT = float(
    os.getenv("REDIS_SOCKET_CONNECT_TIMEOUT", 5.0))
REDIS_SOCKET_KEEPALIVE = os.getenv(
    "REDIS_SOCKET_KEEPALIVE", "true").lower() == "true"

# TCP Keepalive options - only set if keepalive is enabled
REDIS_SOCKET_KEEPALIVE_OPTIONS = {}
if REDIS_SOCKET_KEEPALIVE:
    import socket
    REDIS_SOCKET_KEEPALIVE_OPTIONS = {
        socket.TCP_KEEPIDLE: int(os.getenv("REDIS_TCP_KEEPIDLE", 60)),
        socket.TCP_KEEPINTVL: int(os.getenv("REDIS_TCP_KEEPINTVL", 30)),
        socket.TCP_KEEPCNT: int(os.getenv("REDIS_TCP_KEEPCNT", 3))
    }

# Retry Configuration
REDIS_RETRY_ON_TIMEOUT = os.getenv(
    "REDIS_RETRY_ON_TIMEOUT", "true").lower() == "true"
REDIS_HEALTH_CHECK_INTERVAL = int(os.getenv("REDIS_HEALTH_CHECK_INTERVAL", 30))

# Celery Configuration
BROKER_URL = os.getenv("BROKER_URL", REDIS_URL)
RESULT_BACKEND = os.getenv("RESULT_BACKEND", REDIS_URL)


class RedisConnectionManager:
    """Enhanced Redis connection manager with health checks and failover"""

    def __init__(self):
        self._redis_client: Optional[Redis] = None
        self._connection_pool: Optional[ConnectionPool] = None
        self._sentinel: Optional[Sentinel] = None
        self._last_health_check = 0
        self._is_healthy = False
        self._connection_info = {}

    def _create_connection_pool(self) -> ConnectionPool:
        """Create Redis connection pool with enhanced configuration"""
        pool_kwargs = {
            'host': REDIS_HOST,
            'port': REDIS_PORT,
            'db': REDIS_DB,
            'password': REDIS_PASSWORD,
            'decode_responses': True,
            'max_connections': REDIS_MAX_CONNECTIONS,
            'socket_timeout': REDIS_SOCKET_TIMEOUT,
            'socket_connect_timeout': REDIS_SOCKET_CONNECT_TIMEOUT,
            'socket_keepalive': REDIS_SOCKET_KEEPALIVE,
            'retry_on_timeout': REDIS_RETRY_ON_TIMEOUT,
            'health_check_interval': REDIS_HEALTH_CHECK_INTERVAL,
        }

        # Only add keepalive options if they're set
        if REDIS_SOCKET_KEEPALIVE_OPTIONS:
            pool_kwargs['socket_keepalive_options'] = REDIS_SOCKET_KEEPALIVE_OPTIONS

        # Use Sentinel if configured
        if REDIS_SENTINELS:
            sentinel_hosts = [(host.strip(), 26379)
                              for host in REDIS_SENTINELS if host.strip()]
            self._sentinel = Sentinel(sentinel_hosts)
            return self._sentinel.master_for(
                REDIS_SENTINEL_SERVICE,
                **{k: v for k, v in pool_kwargs.items() if k not in ['host', 'port']}
            ).connection_pool

        return ConnectionPool(**pool_kwargs)

    def _perform_health_check(self) -> bool:
        """Perform Redis health check"""
        try:
            if self._redis_client:
                self._redis_client.ping()
                self._is_healthy = True
                return True
        except (ConnectionError, TimeoutError):
            self._is_healthy = False
            return False
        except Exception:
            self._is_healthy = False
            return False

    def get_client(self) -> Redis:
        """Get Redis client with automatic reconnection"""
        current_time = time.time()

        # Perform health check if needed
        if (current_time - self._last_health_check) > REDIS_HEALTH_CHECK_INTERVAL:
            self._perform_health_check()
            self._last_health_check = current_time

        # Create new connection if needed
        if not self._redis_client or not self._is_healthy:
            try:
                self._connection_pool = self._create_connection_pool()
                self._redis_client = Redis(
                    connection_pool=self._connection_pool)

                # Test connection
                self._redis_client.ping()
                self._is_healthy = True

                # Store connection info for monitoring
                self._connection_info = {
                    'host': REDIS_HOST,
                    'port': REDIS_PORT,
                    'db': REDIS_DB,
                    'max_connections': REDIS_MAX_CONNECTIONS,
                    'sentinel_enabled': bool(REDIS_SENTINELS),
                    'pool_created_at': current_time
                }

            except Exception as e:
                raise

        return self._redis_client

    def get_connection_info(self) -> Dict[str, Any]:
        """Get current connection information"""
        info = self._connection_info.copy()
        if self._connection_pool:
            info.update({
                'pool_created_connections': self._connection_pool.created_connections,
                'pool_available_connections': len(self._connection_pool._available_connections),
                'pool_in_use_connections': len(self._connection_pool._in_use_connections),
                'is_healthy': self._is_healthy,
                'last_health_check': self._last_health_check
            })
        return info

    def close(self):
        """Close Redis connections"""
        if self._connection_pool:
            self._connection_pool.disconnect()
        self._redis_client = None
        self._connection_pool = None
        self._is_healthy = False


# Global Redis connection manager
redis_manager = RedisConnectionManager()


@contextmanager
def get_redis_client():
    """Context manager for Redis client with automatic error handling"""
    client = None
    try:
        client = redis_manager.get_client()
        yield client
    except Exception:
        raise
    finally:
        # Connection is returned to pool automatically
        pass

# Backward compatibility - lazy initialization


def get_redis_client_instance():
    """Get Redis client instance (for backward compatibility)"""
    return redis_manager.get_client()


# Create global client reference (lazy loaded)
redis_client = None


def initialize_redis():
    """Initialize Redis client"""
    global redis_client
    redis_client = redis_manager.get_client()
    return redis_client
