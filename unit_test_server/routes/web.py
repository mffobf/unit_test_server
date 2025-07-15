# unit_test_server/routes/web.py
from flask import Blueprint, render_template

web_bp = Blueprint('web', __name__)


@web_bp.route('/')
def index():
    """Main application page"""
    return render_template('index.html')
