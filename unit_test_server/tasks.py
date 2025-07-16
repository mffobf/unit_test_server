# unit_test_server/enhanced_tasks.py
from unit_test_server.celery_worker import celery_app
from unit_test_server.test_runner import run_single_test
from unit_test_server.runtime import update_test_result
from unit_test_server.socket import socketio
from unit_test_server.memory_tracker import MemoryMonitor
import time
import signal
import psutil
import os
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
    time_limit=60,
    soft_time_limit=45
)
def run_test_task(self, test_id, test_group, test_file, test_function):
    """Enhanced Celery task with comprehensive resource monitoring"""
    
    # Initialize task-level monitoring
    task_memory_monitor = MemoryMonitor(interval=0.1)
    task_memory_monitor.start()
    
    task_start_time = time.time()
    worker_process = psutil.Process()
    initial_worker_memory = worker_process.memory_info().rss

    # Set up signal handler for graceful shutdown
    def timeout_handler(signum, frame):
        raise TimeoutError("Test execution timed out")

    signal.signal(signal.SIGALRM, timeout_handler)
    signal.alarm(40)

    try:
        # Update status to running
        running = update_test_result(test_id, {
            'status': 'running',
            'started_at': time.time(),
            'worker_pid': os.getpid(),
            'worker_memory_initial': initial_worker_memory
        })
        if running:
            socketio.emit('test_update', running)

        # Run the test with enhanced monitoring
        result = run_single_test(test_group, test_file, test_function)

        # Stop task-level monitoring
        task_memory_stats = task_memory_monitor.stop()
        
        # Calculate comprehensive metrics
        task_duration = round(time.time() - task_start_time, 2)
        test_duration = result.get('duration', 0)
        final_worker_memory = worker_process.memory_info().rss
        
        # Enhanced result with task-level metrics
        enhanced_resource_usage = result.get('resource_usage', {})
        enhanced_resource_usage.update({
            'task_memory_stats': task_memory_stats,
            'worker_memory_delta': final_worker_memory - initial_worker_memory,
            'worker_memory_final': final_worker_memory,
            'task_level_monitoring': True
        })

        # Update with comprehensive completion data
        complete = update_test_result(test_id, {
            'status': 'completed',
            'result': result['result'],
            'output': result['output'],
            'error': result['error'],
            'duration': test_duration,
            'task_duration': task_duration,
            'completed_at': time.time(),
            'worker_id': self.request.hostname,
            'resource_usage': enhanced_resource_usage,
            'memory_summary': _create_memory_summary(enhanced_resource_usage)
        })

        if complete:
            socketio.emit('test_update', complete)

        return result

    except Exception as e:
        # Stop monitoring on error
        task_memory_stats = task_memory_monitor.stop()
        task_duration = round(time.time() - task_start_time, 2)
        
        error_result = {
            'status': 'error',
            'result': 'error',
            'error': str(e),
            'duration': 0,
            'task_duration': task_duration,
            'worker_id': self.request.hostname,
            'resource_usage': {
                'task_memory_stats': task_memory_stats,
                'execution_time': task_duration
            }
        }

        update_test_result(test_id, error_result)
        socketio.emit('test_update', error_result)

        if self.request.retries < self.max_retries:
            raise self.retry(countdown=5)

        raise

    finally:
        signal.alarm(0)
        # Ensure monitoring is stopped
        if task_memory_monitor.monitoring:
            task_memory_monitor.stop()


def _create_memory_summary(resource_usage):
    """Create a human-readable memory summary"""
    summary = {}
    
    # Test-level memory stats
    if 'memory_stats' in resource_usage:
        test_stats = resource_usage['memory_stats']
        if 'rss_stats' in test_stats:
            rss = test_stats['rss_stats']
            summary['test_memory'] = {
                'peak_mb': round(rss.get('peak', 0) / (1024 * 1024), 2),
                'delta_mb': round(rss.get('delta', 0) / (1024 * 1024), 2),
                'efficiency': resource_usage.get('memory_efficiency', 0),
                'stability': resource_usage.get('memory_stability', 0)
            }
    
    # Task-level memory stats  
    if 'task_memory_stats' in resource_usage:
        task_stats = resource_usage['task_memory_stats']
        if 'rss_stats' in task_stats:
            rss = task_stats['rss_stats']
            summary['task_memory'] = {
                'peak_mb': round(rss.get('peak', 0) / (1024 * 1024), 2),
                'delta_mb': round(rss.get('delta', 0) / (1024 * 1024), 2)
            }
    
    # Worker-level memory
    worker_delta = resource_usage.get('worker_memory_delta', 0)
    if worker_delta:
        summary['worker_memory'] = {
            'delta_mb': round(worker_delta / (1024 * 1024), 2)
        }
    
    return summary