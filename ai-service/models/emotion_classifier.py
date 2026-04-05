"""
MindEase — Emotion Classifier
Detects emotion from text using:
  1. HuggingFace Transformers model (primary, ~300 MB download on first use)
  2. Keyword-based classifier (instant fallback, no download needed)

Set EMOTION_MODEL=keyword in .env to skip the HuggingFace model entirely.
"""

import os
import re
from dotenv import load_dotenv

load_dotenv()

# ── Keyword-based fallback classifier ─────────────────────────────────────────
# Maps each emotion to a list of indicator words/phrases.
KEYWORD_MAP = {
    "happy": [
        "happy", "happiness", "joy", "joyful", "excited", "great", "wonderful",
        "amazing", "fantastic", "love", "loved", "awesome", "good", "pleased",
        "cheerful", "delighted", "grateful", "thankful", "blessed", "elated",
        "thrilled", "positive", "smile", "laugh", "fun", "enjoy", "enjoyed",
    ],
    "sad": [
        "sad", "sadness", "unhappy", "depressed", "depression", "cry", "crying",
        "tears", "hopeless", "worthless", "empty", "lonely", "alone", "lost",
        "grief", "grieving", "heartbroken", "miserable", "gloomy", "down",
        "blue", "upset", "devastated", "hurt", "pain", "painful", "broken",
        "no reason to live", "give up", "can't go on", "end it",
    ],
    "angry": [
        "angry", "anger", "furious", "rage", "hate", "frustrated", "frustration",
        "irritated", "annoyed", "mad", "livid", "outraged", "resentful",
        "bitter", "hostile", "aggressive", "fed up", "sick of", "unfair",
        "betrayed", "disgusted",
    ],
    "anxious": [
        "anxious", "anxiety", "worried", "worry", "nervous", "scared", "fear",
        "fearful", "panic", "panicking", "stress", "stressed", "overwhelmed",
        "dread", "dreading", "terrified", "tense", "uneasy", "restless",
        "apprehensive", "phobia", "insecure", "uncertain", "what if",
    ],
    "neutral": [
        "okay", "ok", "fine", "alright", "normal", "so-so", "not much",
        "nothing much", "just checking", "wondering", "curious",
    ],
}

# Crisis keywords that trigger the SOS pathway
CRISIS_KEYWORDS = [
    "kill myself", "end my life", "suicide", "suicidal", "want to die",
    "don't want to live", "no reason to live", "can't go on", "give up on life",
    "hurt myself", "self harm", "self-harm",
]


def _keyword_classify(text: str) -> dict:
    """
    Simple keyword-based emotion classifier.
    Returns the emotion with the most matching keywords.
    """
    text_lower = text.lower()
    scores = {emotion: 0 for emotion in KEYWORD_MAP}

    for emotion, keywords in KEYWORD_MAP.items():
        for kw in keywords:
            if kw in text_lower:
                scores[emotion] += 1

    # Determine winning emotion
    best_emotion = max(scores, key=scores.get)
    best_count = scores[best_emotion]

    if best_count == 0:
        best_emotion = "neutral"

    # Normalise score to 0.5 – 0.95 range
    normalised = min(0.5 + best_count * 0.1, 0.95)

    return {
        "emotion": best_emotion,
        "score": round(normalised, 3),
        "method": "keyword",
    }


# ── HuggingFace Transformer classifier ───────────────────────────────────────
_pipeline = None  # lazy-loaded

# Mapping from HuggingFace model labels → our labels
HF_LABEL_MAP = {
    "joy":      "happy",
    "sadness":  "sad",
    "anger":    "angry",
    "fear":     "anxious",
    "disgust":  "angry",
    "surprise": "neutral",
    "neutral":  "neutral",
}


def _load_pipeline():
    global _pipeline
    if _pipeline is not None:
        return _pipeline

    model_name = os.getenv("EMOTION_MODEL", "j-hartmann/emotion-english-distilroberta-base")
    if model_name == "keyword":
        return None  # intentionally skip

    try:
        from transformers import pipeline
        print(f"🔄 Loading HuggingFace model: {model_name} …")
        _pipeline = pipeline(
            "text-classification",
            model=model_name,
            top_k=None,  # return all labels with scores
            device=-1,   # CPU
        )
        print("✅ HuggingFace emotion model loaded")
    except Exception as e:
        print(f"⚠️  Could not load HuggingFace model ({e}). Falling back to keyword classifier.")
        _pipeline = None

    return _pipeline


def _hf_classify(text: str) -> dict:
    """
    Use the HuggingFace transformer model to classify emotion.
    """
    pipe = _load_pipeline()
    if pipe is None:
        return None  # trigger fallback

    try:
        results = pipe(text[:512])[0]  # truncate to model max length
        # results = [{'label': 'joy', 'score': 0.92}, ...]
        top = max(results, key=lambda x: x["score"])
        mapped_emotion = HF_LABEL_MAP.get(top["label"].lower(), "neutral")
        return {
            "emotion": mapped_emotion,
            "score": round(top["score"], 3),
            "method": "transformer",
            "raw_label": top["label"],
        }
    except Exception as e:
        print(f"⚠️  HuggingFace inference error: {e}")
        return None


def _check_crisis(text: str) -> bool:
    """Return True if the text contains crisis-level language."""
    text_lower = text.lower()
    return any(kw in text_lower for kw in CRISIS_KEYWORDS)


def classify_emotion(text: str) -> dict:
    """
    Public interface: classify the emotion in text.
    Returns:
      {
        "emotion": str,   # happy | sad | angry | anxious | neutral
        "score": float,   # 0.0 – 1.0
        "isCrisis": bool,
        "method": str,
      }
    """
    if not text or not text.strip():
        return {"emotion": "neutral", "score": 0.5, "isCrisis": False, "method": "default"}

    # Try HuggingFace first
    result = _hf_classify(text)

    # Fall back to keyword classifier if transformer unavailable
    if result is None:
        result = _keyword_classify(text)

    # Crisis check (override score if crisis detected)
    is_crisis = _check_crisis(text)
    if is_crisis:
        result["emotion"] = "sad"
        result["score"] = 0.95

    result["isCrisis"] = is_crisis
    return result
