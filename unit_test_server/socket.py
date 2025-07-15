# unit_test_server/socket.py
from flask_socketio import SocketIO

from unit_test_server.config import REDIS_URL

socketio = SocketIO(
    cors_allowed_origins="*",
    message_queue=REDIS_URL,
    async_mode="threading"
)
