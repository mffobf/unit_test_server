# unit_test_server/app.py
import os
from flask import Flask
from unit_test_server.error_handlers import register_error_handlers
from unit_test_server.socket import socketio
from unit_test_server.runtime import set_socketio
from unit_test_server.routes import register_routes
from unit_test_server.config import initialize_redis


def create_app():
    """Create Flask app with configuration"""
    app = Flask(__name__, static_folder='static', template_folder='templates')
    app.config['SECRET_KEY'] = os.environ.get(
        'SECRET_KEY', 'your-secret-key-change-this')

    # Initialize Redis connection
    try:
        initialize_redis()
    except Exception as e:
        raise

    # Register error handlers
    register_error_handlers(app)

    # Initialize SocketIO
    socketio.init_app(app)
    set_socketio(socketio)

    # Register all routes
    register_routes(app)

    return app


if __name__ == '__main__':
    app = create_app()
    socketio.run(
        app,
        debug=True,
        host='0.0.0.0',
        port=int(os.environ.get('PORT', 5000)),
        allow_unsafe_werkzeug=True
    )
