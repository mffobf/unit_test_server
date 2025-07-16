# unit_test_server/memory_analytics.py
from typing import Dict, List, Optional, Any
import statistics
import json
from datetime import datetime, timedelta


class MemoryAnalytics:
    """Advanced memory analytics and reporting"""
    
    def __init__(self):
        self.test_results: List[Dict] = []
        
    def add_test_result(self, test_result: Dict):
        """Add a test result for analysis"""
        if 'resource_usage' in test_result:
            self.test_results.append(test_result)
    
    def analyze_memory_trends(self, time_window_hours: int = 24) -> Dict:
        """Analyze memory usage trends over time"""
        if not self.test_results:
            return {}
        
        # Filter results within time window
        cutoff_time = datetime.now() - timedelta(hours=time_window_hours)
        recent_results = [
            result for result in self.test_results
            if datetime.fromtimestamp(result.get('completed_at', 0)) > cutoff_time
        ]
        
        if not recent_results:
            return {}
        
        # Extract memory metrics
        peak_memories = []
        memory_deltas = []
        efficiencies = []
        stabilities = []
        
        for result in recent_results:
            memory_summary = result.get('memory_summary', {})
            test_memory = memory_summary.get('test_memory', {})
            
            if test_memory:
                peak_memories.append(test_memory.get('peak_mb', 0))
                memory_deltas.append(test_memory.get('delta_mb', 0))
                efficiencies.append(test_memory.get('efficiency', 0))
                stabilities.append(test_memory.get('stability', 0))
        
        analysis = {
            'time_window_hours': time_window_hours,
            'total_tests': len(recent_results),
            'peak_memory': {
                'average': round(statistics.mean(peak_memories), 2) if peak_memories else 0,
                'median': round(statistics.median(peak_memories), 2) if peak_memories else 0,
                'max': round(max(peak_memories), 2) if peak_memories else 0,
                'min': round(min(peak_memories), 2) if peak_memories else 0,
                'stdev': round(statistics.stdev(peak_memories), 2) if len(peak_memories) > 1 else 0
            },
            'memory_delta': {
                'average': round(statistics.mean(memory_deltas), 2) if memory_deltas else 0,
                'median': round(statistics.median(memory_deltas), 2) if memory_deltas else 0,
                'max': round(max(memory_deltas), 2) if memory_deltas else 0,
                'min': round(min(memory_deltas), 2) if memory_deltas else 0
            },
            'efficiency': {
                'average': round(statistics.mean(efficiencies), 2) if efficiencies else 0,
                'median': round(statistics.median(efficiencies), 2) if efficiencies else 0
            },
            'stability': {
                'average': round(statistics.mean(stabilities), 2) if stabilities else 0,
                'median': round(statistics.median(stabilities), 2) if stabilities else 0
            }
        }
        
        return analysis
    
    def identify_memory_leaks(self, threshold_mb: float = 10.0) -> List[Dict]:
        """Identify potential memory leaks based on memory delta patterns"""
        leaky_tests = []
        
        for result in self.test_results:
            memory_summary = result.get('memory_summary', {})
            test_memory = memory_summary.get('test_memory', {})
            
            delta_mb = test_memory.get('delta_mb', 0)
            if delta_mb > threshold_mb:
                leaky_tests.append({
                    'test_id': result.get('test_id'),
                    'test_group': result.get('test_group'),
                    'test_file': result.get('test_file'),
                    'test_function': result.get('test_function'),
                    'memory_delta_mb': delta_mb,
                    'peak_memory_mb': test_memory.get('peak_mb', 0),
                    'efficiency': test_memory.get('efficiency', 0),
                    'completed_at': result.get('completed_at')
                })
        
        return sorted(leaky_tests, key=lambda x: x['memory_delta_mb'], reverse=True)
    
    def generate_memory_report(self, output_file: Optional[str] = None) -> str:
        """Generate comprehensive memory usage report"""
        if not self.test_results:
            return "No test results available for analysis."
        
        trends_24h = self.analyze_memory_trends(24)
        trends_7d = self.analyze_memory_trends(24 * 7)
        leaky_tests = self.identify_memory_leaks()
        
        report = f"""
# Memory Usage Analysis Report
Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## Summary
- Total tests analyzed: {len(self.test_results)}
- Tests with potential memory leaks: {len(leaky_tests)}

## 24-Hour Trends
- Average peak memory: {trends_24h.get('peak_memory', {}).get('average', 0):.2f} MB
- Average memory delta: {trends_24h.get('memory_delta', {}).get('average', 0):.2f} MB
- Average efficiency: {trends_24h.get('efficiency', {}).get('average', 0):.2f}%
- Average stability: {trends_24h.get('stability', {}).get('average', 0):.2f}%

## 7-Day Trends
- Average peak memory: {trends_7d.get('peak_memory', {}).get('average', 0):.2f} MB
- Average memory delta: {trends_7d.get('memory_delta', {}).get('average', 0):.2f} MB
- Average efficiency: {trends_7d.get('efficiency', {}).get('average', 0):.2f}%
- Average stability: {trends_7d.get('stability', {}).get('average', 0):.2f}%

## Top Memory Consumers
"""
        
        # Add top 10 leaky tests
        for i, test in enumerate(leaky_tests[:10], 1):
            report += f"{i}. {test['test_file']}::{test['test_function']} - {test['memory_delta_mb']:.2f} MB\n"
        
        if output_file:
            with open(output_file, 'w') as f:
                f.write(report)
        
        return report
    
    def export_data(self, output_file: str, format: str = 'json'):
        """Export memory data for external analysis"""
        if format == 'json':
            with open(output_file, 'w') as f:
                json.dump(self.test_results, f, indent=2)
        elif format == 'csv':
            import csv
            with open(output_file, 'w', newline='') as f:
                writer = csv.writer(f)
                writer.writerow([
                    'test_id', 'test_file', 'test_function', 'duration',
                    'peak_memory_mb', 'memory_delta_mb', 'efficiency', 'stability'
                ])
                
                for result in self.test_results:
                    memory_summary = result.get('memory_summary', {})
                    test_memory = memory_summary.get('test_memory', {})
                    
                    writer.writerow([
                        result.get('test_id', ''),
                        result.get('test_file', ''),
                        result.get('test_function', ''),
                        result.get('duration', 0),
                        test_memory.get('peak_mb', 0),
                        test_memory.get('delta_mb', 0),
                        test_memory.get('efficiency', 0),
                        test_memory.get('stability', 0)
                    ])