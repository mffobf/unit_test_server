# unit_test_server/routes/api/__init__.py
from flask import Blueprint

api_bp = Blueprint('api', __name__)

# Import all API route modules to register them
from unit_test_server.routes.api import tests, cache, results, memory