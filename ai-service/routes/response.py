"""
MindEase — Response Route (Advanced)
POST /respond → { response }
Now accepts context, faceEmotion, and faceEmotionScore for richer AI replies.
"""

from flask import Blueprint, request, jsonify
from routes.response_engine import generate_response

response_bp = Blueprint("response", __name__)


@response_bp.route("/respond", methods=["POST"])
def respond():
    data = request.get_json(silent=True) or {}
    text             = data.get("text", "").strip()
    emotion          = data.get("emotion", "neutral")
    score            = float(data.get("score", 0.5))
    is_crisis        = bool(data.get("isCrisis", False))
    context          = data.get("context", [])          # list of { role, content }
    face_emotion     = data.get("faceEmotion")          # str or None
    face_score       = data.get("faceEmotionScore")     # float or None

    if not text:
        return jsonify({"error": "text field is required"}), 400

    reply = generate_response(
        emotion=emotion,
        score=score,
        is_crisis=is_crisis,
        text=text,
        context=context,
        face_emotion=face_emotion,
        face_score=float(face_score) if face_score is not None else None,
    )
    return jsonify({"response": reply}), 200
