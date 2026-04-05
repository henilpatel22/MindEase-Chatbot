"""
MindEase — Python AI Service
Provides emotion detection and rule-based response generation.
Runs on port 5001 (separate from the Node.js backend).
"""

from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173", "http://localhost:5000"])

# ── Register blueprints (route groups) ────────────────────────────────────────
from routes.emotion import emotion_bp
from routes.response import response_bp

app.register_blueprint(emotion_bp)
app.register_blueprint(response_bp)


@app.route("/health")
def health():
    return {"status": "ok", "service": "MindEase AI Service"}, 200


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5001))
    debug = os.getenv("FLASK_DEBUG", "true").lower() == "true"
    print(f"\n🤖 MindEase AI Service running on http://localhost:{port}\n")
    app.run(host="0.0.0.0", port=port, debug=debug)
