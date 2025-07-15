# unit_test_server/routes/__init__.py

def register_routes(app):
    """Register all route blueprints with the Flask app"""
    # Import blueprints
    from .web import web_bp
    from .api import api_bp

    # Register blueprints
    app.register_blueprint(web_bp)
    app.register_blueprint(api_bp, url_prefix='/api')

    # Print registered routes for debugging
    print("Registered routes:")
    for rule in app.url_map.iter_rules():
        print(f"  {rule.rule} -> {rule.endpoint}")
