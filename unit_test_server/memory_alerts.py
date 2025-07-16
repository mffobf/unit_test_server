# unit_test_server/memory_alerts.py
from typing import Dict, List, Callable, Optional
import logging
from enum import Enum


class AlertLevel(Enum):
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"


class MemoryAlert:
    """Memory monitoring alert system"""
    
    def __init__(self, name: str, level: AlertLevel, condition: Callable[[Dict], bool], 
                 message: str, cooldown_minutes: int = 5):
        self.name = name
        self.level = level
        self.condition = condition
        self.message = message
        self.cooldown_minutes = cooldown_minutes
        self.last_triggered = None
        
    def check(self, test_result: Dict) -> Optional[str]:
        """Check if alert should trigger"""
        import time
        
        if self.last_triggered:
            time_since_last = (time.time() - self.last_triggered) / 60
            if time_since_last < self.cooldown_minutes:
                return None
        
        if self.condition(test_result):
            self.last_triggered = time.time()
            return self.message.format(**test_result)
        
        return None


class MemoryAlertManager:
    """Manages memory alerts and notifications"""
    
    def __init__(self):
        self.alerts: List[MemoryAlert] = []
        self.logger = logging.getLogger(__name__)
        self.setup_default_alerts()
    
    def setup_default_alerts(self):
        """Set up default memory alerts"""
        
        # High memory usage alert
        self.add_alert(
            name="high_memory_usage",
            level=AlertLevel.WARNING,
            condition=lambda result: (
                result.get('memory_summary', {})
                .get('test_memory', {})
                .get('peak_mb', 0) > 100
            ),
            message="Test {test_file}::{test_function} used {memory_summary[test_memory][peak_mb]:.2f} MB",
            cooldown_minutes=10
        )
        
        # Memory leak alert
        self.add_alert(
            name="memory_leak",
            level=AlertLevel.CRITICAL,
            condition=lambda result: (
                result.get('memory_summary', {})
                .get('test_memory', {})
                .get('delta_mb', 0) > 50
            ),
            message="Potential memory leak in {test_file}::{test_function} - {memory_summary[test_memory][delta_mb]:.2f} MB not released",
            cooldown_minutes=5
        )
        
        # Low efficiency alert
        self.add_alert(
            name="low_efficiency",
            level=AlertLevel.WARNING,
            condition=lambda result: (
                result.get('memory_summary', {})
                .get('test_memory', {})
                .get('efficiency', 100) < 30
            ),
            message="Low memory efficiency in {test_file}::{test_function} - {memory_summary[test_memory][efficiency]:.1f}%",
            cooldown_minutes=15
        )
    
    def add_alert(self, name: str, level: AlertLevel, condition: Callable[[Dict], bool], 
                  message: str, cooldown_minutes: int = 5):
        """Add a new alert"""
        alert = MemoryAlert(name, level, condition, message, cooldown_minutes)
        self.alerts.append(alert)
    
    def check_alerts(self, test_result: Dict) -> List[str]:
        """Check all alerts against test result"""
        triggered_alerts = []
        
        for alert in self.alerts:
            try:
                alert_message = alert.check(test_result)
                if alert_message:
                    triggered_alerts.append(alert_message)
                    
                    # Log based on alert level
                    if alert.level == AlertLevel.INFO:
                        self.logger.info(f"[{alert.name}] {alert_message}")
                    elif alert.level == AlertLevel.WARNING:
                        self.logger.warning(f"[{alert.name}] {alert_message}")
                    elif alert.level == AlertLevel.CRITICAL:
                        self.logger.error(f"[{alert.name}] {alert_message}")
            
            except Exception as e:
                self.logger.error(f"Error checking alert {alert.name}: {e}")
        
        return triggered_alerts


# Example usage in your existing code
def enhanced_update_test_result(test_id: str, result_data: Dict):
    """Enhanced version of update_test_result with memory alerts"""
    from unit_test_server.runtime import update_test_result
    
    # Initialize alert manager (you might want to make this a singleton)
    alert_manager = MemoryAlertManager()
    
    # Check for memory alerts
    if 'memory_summary' in result_data:
        triggered_alerts = alert_manager.check_alerts(result_data)
        if triggered_alerts:
            result_data['memory_alerts'] = triggered_alerts
    
    # Call original function
    return update_test_result(test_id, result_data)