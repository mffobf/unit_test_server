# unit_test_server/test_runner.py
import subprocess
import os
import sys
import time
import tempfile
import shutil
import psutil
from contextlib import contextmanager
from unit_test_server.config import TESTS_PATH


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
    Enhanced test runner with resource monitoring and isolation
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
        # Monitor resource usage
        process = psutil.Process()
        start_memory = process.memory_info().rss
        start_time = time.perf_counter()

        try:
            # Enhanced pytest command with more options
            cmd = [
                sys.executable, '-m', 'pytest', test_identifier,
                '-v', '--tb=short', '--no-header', '--durations=0',
                '--strict-markers', '--strict-config',
                f'--basetemp={temp_dir}',
                '--disable-warnings'  # Optional: reduce noise
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
            end_memory = process.memory_info().rss

            # Extract pytest duration
            pytest_duration = _extract_pytest_duration(proc.stdout)
            execution_duration = round(end_time - start_time, 3)

            resource_usage = {
                'memory_delta': end_memory - start_memory,
                'peak_memory': end_memory,
                'execution_time': execution_duration
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
            return {
                'result': 'timeout',
                'output': '',
                'error': 'Test execution timed out after 30 seconds',
                'duration': execution_duration,
                'resource_usage': {'execution_time': execution_duration}
            }
        except Exception as e:
            execution_duration = round(time.perf_counter() - start_time, 3)
            return {
                'result': 'error',
                'output': '',
                'error': str(e),
                'duration': execution_duration,
                'resource_usage': {'execution_time': execution_duration}
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
