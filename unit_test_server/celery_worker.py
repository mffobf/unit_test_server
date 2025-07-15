# celery_worker.py
from celery import Celery
from unit_test_server.config import BROKER_URL, RESULT_BACKEND


celery_app = Celery(
    "unit_test_server",
    broker=BROKER_URL,
    backend=RESULT_BACKEND,
    include=["unit_test_server.tasks"]
)


# Enhanced configuration
celery_app.conf.update(
    # Serialization
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',

    # Timezone
    timezone='UTC',
    enable_utc=True,

    # Task execution
    task_always_eager=False,  # Set to True for testing
    task_eager_propagates=True,
    task_ignore_result=False,
    task_store_eager_result=True,
    task_soft_time_limit=30,
    task_time_limit=60,

    # Result backend settings
    result_expires=3600,  # 1 hour
    result_persistent=True,
    result_compression='gzip',

    # Worker settings
    worker_prefetch_multiplier=1,  # Important for test execution
    worker_max_tasks_per_child=1000,  # Prevent memory leaks
    worker_disable_rate_limits=True,

    # Task routing and priorities
    task_default_queue='tests',
    task_routes={
        'unit_test_server.tasks.run_test_task': {'queue': 'tests'},
        'unit_test_server.tasks.cleanup_task': {'queue': 'cleanup'}
    },

    # Retry configuration
    task_default_retry_delay=60,
    task_max_retries=3,

    # Monitoring
    worker_send_task_events=True,
    task_send_sent_event=True,

    # Security
    task_reject_on_worker_lost=True,
    worker_hijack_root_logger=False,
    worker_log_color=False,

    # Performance
    broker_connection_retry_on_startup=True,
    broker_connection_retry=True,
    broker_pool_limit=10,
)

# Queue definitions
celery_app.conf.task_routes = {
    'unit_test_server.tasks.run_test_task': {
        'queue': 'tests',
        'routing_key': 'test.run',
    },
    'unit_test_server.tasks.cleanup_task': {
        'queue': 'cleanup',
        'routing_key': 'test.cleanup',
    }
}
