# unit_test_server/routes/websocket.py
from unit_test_server.socket import socketio
from unit_test_server.runtime import get_all_test_results


@socketio.on('connect')
def on_connect():
    """Handle WebSocket connection"""
    try:
        tests = get_all_test_results()
        socketio.emit('test_bulk_update', {'tests': tests})
    except Exception as e:
        # Log error but don't break the connection
        socketio.emit(
            'error', {'message': f'Failed to load initial data: {str(e)}'})


@socketio.on('disconnect')
def on_disconnect():
    """Handle WebSocket disconnection"""
    # Clean up any client-specific resources if needed
    pass
