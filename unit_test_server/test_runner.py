# unit_test_server/enhanced_test_runner.py
import subprocess
import os
import sys
import time
import tempfile
import shutil
import psutil
from contextlib import contextmanager
from unit_test_server.config import TESTS_PATH
from unit_test_server.memory_tracker import MemoryMonitor


@contextmanager
def test_environment():
    """Context manager for test environment setup and cleanup"""
    temp_dir = tempfile.mkdtemp(prefix="test_env_")
    old_cwd = os.getcwd()

    try:
        # Set up isolated environment
        os.environ['TMPDIR'] = temp_dir
        yield temp_dir
    finally:
        # Cleanup
        os.chdir(old_cwd)
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir, ignore_errors=True)


def run_single_test(test_group, test_file, test_function):
    """
    Enhanced test runner with comprehensive memory monitoring
    """
    abs_test_path = os.path.join(TESTS_PATH, test_group, test_file)
    if not os.path.isfile(abs_test_path):
        return {
            'result': 'file_not_found',
            'output': '',
            'error': f'Test file not found: {abs_test_path}',
            'duration': 0,
            'resource_usage': {}
        }

    test_identifier = f"{abs_test_path}::{test_function}"
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

    with test_environment() as temp_dir:
        # Initialize memory monitor
        memory_monitor = MemoryMonitor(interval=0.05)  # Sample every 50ms
        memory_monitor.start()
        
        start_time = time.perf_counter()

        try:
            # Enhanced pytest command
            cmd = [
                sys.executable, '-m', 'pytest', test_identifier,
                '-v', '--tb=short', '--no-header', '--durations=0',
                '--strict-markers', '--strict-config',
                f'--basetemp={temp_dir}',
                '--disable-warnings'
            ]

            proc = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=30,
                cwd=project_root,
                env={**os.environ, 'PYTHONPATH': project_root}
            )

            end_time = time.perf_counter()
            
            # Stop memory monitoring and get comprehensive stats
            memory_stats = memory_monitor.stop()

            # Extract pytest duration
            pytest_duration = _extract_pytest_duration(proc.stdout)
            execution_duration = round(end_time - start_time, 3)

            # Enhanced resource usage with detailed memory tracking
            resource_usage = {
                'execution_time': execution_duration,
                'memory_stats': memory_stats,
                # Legacy compatibility
                'memory_delta': memory_stats.get('rss_stats', {}).get('delta', 0),
                'peak_memory': memory_stats.get('rss_stats', {}).get('peak', 0),
                # Additional metrics
                'memory_efficiency': _calculate_memory_efficiency(memory_stats),
                'memory_stability': _calculate_memory_stability(memory_stats)
            }

            status = 'passed' if proc.returncode == 0 else 'failed'

            return {
                'result': status,
                'output': proc.stdout,
                'error': proc.stderr or None,
                'duration': pytest_duration if pytest_duration else execution_duration,
                'resource_usage': resource_usage,
                'return_code': proc.returncode
            }

        except subprocess.TimeoutExpired:
            execution_duration = round(time.perf_counter() - start_time, 3)
            memory_stats = memory_monitor.stop()
            
            return {
                'result': 'timeout',
                'output': '',
                'error': 'Test execution timed out after 30 seconds',
                'duration': execution_duration,
                'resource_usage': {
                    'execution_time': execution_duration,
                    'memory_stats': memory_stats
                }
            }
        except Exception as e:
            execution_duration = round(time.perf_counter() - start_time, 3)
            memory_stats = memory_monitor.stop()
            
            return {
                'result': 'error',
                'output': '',
                'error': str(e),
                'duration': execution_duration,
                'resource_usage': {
                    'execution_time': execution_duration,
                    'memory_stats': memory_stats
                }
            }


def _extract_pytest_duration(output):
    """Extract test duration from pytest output"""
    try:
        lines = output.split('\n')
        for line in lines:
            if '::' in line and 's call' in line:
                parts = line.strip().split()
                if parts and parts[0].endswith('s'):
                    duration_str = parts[0][:-1]
                    return round(float(duration_str), 3)
    except (ValueError, IndexError):
        pass
    return None


def _calculate_memory_efficiency(memory_stats):
    """Calculate memory efficiency score (0-100)"""
    if not memory_stats or 'rss_stats' not in memory_stats:
        return 0
    
    rss_stats = memory_stats['rss_stats']
    if rss_stats.get('peak', 0) == 0:
        return 0
    
    # Efficiency based on peak vs average usage
    peak = rss_stats.get('peak', 0)
    average = rss_stats.get('average', 0)
    
    if peak == 0:
        return 0
    
    efficiency = (average / peak) * 100
    return round(efficiency, 2)


def _calculate_memory_stability(memory_stats):
    """Calculate memory stability score (0-100)"""
    if not memory_stats or 'rss_stats' not in memory_stats:
        return 0
    
    rss_stats = memory_stats['rss_stats']
    peak = rss_stats.get('peak', 0)
    min_mem = rss_stats.get('min', 0)
    
    if peak == 0:
        return 100
    
    # Stability based on variance (lower variance = higher stability)
    variance = peak - min_mem
    stability = max(0, 100 - (variance / peak * 100))
    return round(stability, 2)