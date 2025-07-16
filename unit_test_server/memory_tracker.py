# unit_test_server/memory_tracker.py
import psutil
import time
import threading
from dataclasses import dataclass
from typing import Dict, List, Optional
import gc
import tracemalloc
from contextlib import contextmanager


@dataclass
class MemorySnapshot:
    """Represents a memory usage snapshot"""
    timestamp: float
    rss: int  # Resident Set Size in bytes
    vms: int  # Virtual Memory Size in bytes
    percent: float  # Memory percentage
    available: int  # Available memory in bytes
    tracemalloc_current: Optional[int] = None
    tracemalloc_peak: Optional[int] = None


class MemoryMonitor:
    """Continuous memory monitoring during test execution"""
    
    def __init__(self, interval: float = 0.1):
        self.interval = interval
        self.process = psutil.Process()
        self.snapshots: List[MemorySnapshot] = []
        self.monitoring = False
        self.monitor_thread = None
        self.start_time = None
        
    def start(self):
        """Start continuous memory monitoring"""
        if self.monitoring:
            return
            
        self.monitoring = True
        self.start_time = time.time()
        self.snapshots.clear()
        
        # Start tracemalloc for detailed Python memory tracking
        tracemalloc.start()
        
        # Start monitoring thread
        self.monitor_thread = threading.Thread(target=self._monitor_loop, daemon=True)
        self.monitor_thread.start()
        
    def stop(self) -> Dict:
        """Stop monitoring and return comprehensive memory stats"""
        if not self.monitoring:
            return {}
            
        self.monitoring = False
        
        # Wait for monitor thread to finish
        if self.monitor_thread:
            self.monitor_thread.join(timeout=1.0)
            
        # Get final tracemalloc stats
        if tracemalloc.is_tracing():
            current, peak = tracemalloc.get_traced_memory()
            tracemalloc.stop()
        else:
            current = peak = 0
            
        # Force garbage collection
        gc.collect()
        
        if not self.snapshots:
            return {}
            
        # Calculate statistics
        rss_values = [s.rss for s in self.snapshots]
        vms_values = [s.vms for s in self.snapshots]
        percent_values = [s.percent for s in self.snapshots]
        
        stats = {
            'duration': time.time() - self.start_time if self.start_time else 0,
            'samples_count': len(self.snapshots),
            'rss_stats': {
                'initial': rss_values[0] if rss_values else 0,
                'final': rss_values[-1] if rss_values else 0,
                'peak': max(rss_values) if rss_values else 0,
                'min': min(rss_values) if rss_values else 0,
                'average': sum(rss_values) / len(rss_values) if rss_values else 0,
                'delta': (rss_values[-1] - rss_values[0]) if len(rss_values) > 1 else 0
            },
            'vms_stats': {
                'initial': vms_values[0] if vms_values else 0,
                'final': vms_values[-1] if vms_values else 0,
                'peak': max(vms_values) if vms_values else 0,
                'delta': (vms_values[-1] - vms_values[0]) if len(vms_values) > 1 else 0
            },
            'memory_percent': {
                'peak': max(percent_values) if percent_values else 0,
                'average': sum(percent_values) / len(percent_values) if percent_values else 0
            },
            'tracemalloc': {
                'current_bytes': current,
                'peak_bytes': peak,
                'current_mb': current / (1024 * 1024),
                'peak_mb': peak / (1024 * 1024)
            }
        }
        
        return stats
    
    def _monitor_loop(self):
        """Background thread for continuous monitoring"""
        while self.monitoring:
            try:
                memory_info = self.process.memory_info()
                memory_percent = self.process.memory_percent()
                virtual_memory = psutil.virtual_memory()
                
                # Get tracemalloc info if available
                tracemalloc_current = tracemalloc_peak = None
                if tracemalloc.is_tracing():
                    tracemalloc_current, tracemalloc_peak = tracemalloc.get_traced_memory()
                
                snapshot = MemorySnapshot(
                    timestamp=time.time(),
                    rss=memory_info.rss,
                    vms=memory_info.vms,
                    percent=memory_percent,
                    available=virtual_memory.available,
                    tracemalloc_current=tracemalloc_current,
                    tracemalloc_peak=tracemalloc_peak
                )
                
                self.snapshots.append(snapshot)
                
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                break
            except Exception:
                # Continue monitoring even if individual samples fail
                pass
                
            time.sleep(self.interval)


@contextmanager
def memory_profiler(interval: float = 0.1):
    """Context manager for memory profiling"""
    monitor = MemoryMonitor(interval)
    monitor.start()
    try:
        yield monitor
    finally:
        stats = monitor.stop()
        # You can log or store these stats
        print(f"Memory profiling completed: {stats}")