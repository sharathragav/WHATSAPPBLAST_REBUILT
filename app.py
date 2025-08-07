import os
import logging
from flask import Flask
from flask_cors import CORS
from werkzeug.middleware.proxy_fix import ProxyFix

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Create the app
app = Flask(__name__, static_folder='dist/public', static_url_path='/')
app.secret_key = os.environ.get("SESSION_SECRET", "dev-secret-key-change-in-production")
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)

# Enable CORS for all domains and routes
CORS(app, resources={
    r"/api/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Configure upload settings
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['UPLOAD_FOLDER'] = 'uploads'

# Create uploads directory if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Import and register API routes
from api.routes import api_bp
app.register_blueprint(api_bp, url_prefix='/api')

# Serve React app for all non-API routes
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react_app(path):
    """Serve the React application for all non-API routes."""
    # Skip API routes
    if path.startswith('api/'):
        return app.response_class(
            status=404,
            response="API endpoint not found"
        )
    
    # Serve static files if they exist
    if path and app.static_folder and os.path.exists(os.path.join(app.static_folder, path)):
        return app.send_static_file(path)
    
    # Serve index.html for all other routes (React routing)
    if app.static_folder and os.path.exists(os.path.join(app.static_folder, 'index.html')):
        return app.send_static_file('index.html')
    
    # Fallback if no static files exist yet
    return '''
    <!DOCTYPE html>
    <html>
    <head>
        <title>WhatsApp Bulk Sender</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .container { max-width: 600px; margin: 0 auto; text-align: center; }
            .error { color: #e74c3c; margin-bottom: 20px; }
            .info { color: #3498db; margin-bottom: 20px; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>WhatsApp Bulk Sender</h1>
            <div class="info">🔧 Frontend is being built...</div>
            <p>The React frontend is currently being compiled. Please wait a moment and refresh the page.</p>
        </div>
    </body>
    </html>
    '''

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
