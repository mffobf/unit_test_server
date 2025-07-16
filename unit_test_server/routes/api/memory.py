from flask import jsonify, Response
from . import api_bp
from unit_test_server.memory_analytics import MemoryAnalytics
from unit_test_server.runtime import get_recent_test_results
from unit_test_server.middleware import redis_health_check

@api_bp.route("/memory/analytics")
@redis_health_check()
def memory_analytics():
    analytics = MemoryAnalytics()
    for result in get_recent_test_results(24):
        analytics.add_test_result(result)

    return jsonify({
        "trends_24h": analytics.analyze_memory_trends(24),
        "potential_leaks": analytics.identify_memory_leaks()[:10],
    })

@api_bp.route("/memory/report")
@redis_health_check()
def memory_report():
    analytics = MemoryAnalytics()
    for result in get_recent_test_results(7 * 24):
        analytics.add_test_result(result)

    md = analytics.generate_memory_report()
    return Response(md, mimetype="text/markdown")
