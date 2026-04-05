"""
MindEase — Emotion Route
POST /analyze  →  { emotion, score, isCrisis, method }
"""

from flask import Blueprint, request, jsonify
from models.emotion_classifier import classify_emotion

emotion_bp = Blueprint("emotion", __name__)


@emotion_bp.route("/analyze", methods=["POST"])
def analyze():
    data = request.get_json(silent=True) or {}
    text = data.get("text", "").strip()

    if not text:
        return jsonify({"error": "text field is required"}), 400

    result = classify_emotion(text)
    return jsonify(result), 200
