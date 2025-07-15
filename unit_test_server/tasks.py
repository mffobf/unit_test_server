# unit_test_server/tasks.py
from unit_test_server.celery_worker import celery_app
from unit_test_server.test_runner import run_single_test
from unit_test_server.runtime import update_test_result
from unit_test_server.socket import socketio
import time
import signal
from celery import Task


class TestTask(Task):
    """Custom task class with enhanced error handling and cleanup"""

    def on_failure(self, exc, args):
        """Handle task failure"""
        test_id = args[0] if args else None
        if test_id:
            update_test_result(test_id, {
                'status': 'error',
                'result': 'error',
                'error': f"Task failed: {str(exc)}",
                'duration': 0
            })


@celery_app.task(
    bind=True,
    base=TestTask,
    name="unit_test_server.tasks.run_test_task",
    autoretry_for=(Exception,),
    retry_kwargs={'max_retries': 2, 'countdown': 5},
    time_limit=60,  # Hard limit
    soft_time_limit=45  # Soft limit
)
def run_test_task(self, test_id, test_group, test_file, test_function):
    """Enhanced Celery task to run a single test"""
    task_start_time = time.time()

    # Set up signal handler for graceful shutdown
    def timeout_handler(signum, frame):
        raise TimeoutError("Test execution timed out")

    signal.signal(signal.SIGALRM, timeout_handler)
    signal.alarm(40)  # 40 second alarm

    try:
        # Update status to running
        running = update_test_result(test_id, {
            'status': 'running',
            'started_at': time.time()
        })
        if running:
            socketio.emit('test_update', running)

        # Run the test
        result = run_single_test(test_group, test_file, test_function)

        # Calculate durations
        task_duration = round(time.time() - task_start_time, 2)
        test_duration = result.get('duration', 0)

        # Update with completion
        complete = update_test_result(
            test_id, {
                'status': 'completed',
                'result': result['result'],
                'output': result['output'],
                'error': result['error'],
                'duration': test_duration,
                'task_duration': task_duration,
                'completed_at': time.time(),
                'worker_id': self.request.hostname
            })

        if complete:
            socketio.emit('test_update', complete)

        return result

    except Exception as e:
        task_duration = round(time.time() - task_start_time, 2)

        error_result = {
            'status': 'error',
            'result': 'error',
            'error': str(e),
            'duration': 0,
            'task_duration': task_duration,
            'worker_id': self.request.hostname
        }

        update_test_result(test_id, error_result)
        socketio.emit('test_update', error_result)

        # Retry logic
        if self.request.retries < self.max_retries:
            raise self.retry(countdown=5)

        raise

    finally:
        signal.alarm(0)  # Cancel the alarm
