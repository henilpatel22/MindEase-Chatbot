"""
MindEase — Advanced Context-Aware Response Engine
No API key required. Generates rich, personalized responses based on:
  - Detected emotion & score
  - Conversation context (last N messages)
  - Face emotion signal
  - Crisis detection
  - Mood trends within the conversation
"""

import random

# ─────────────────────────────────────────────────────────────────────────────
#  Response Bank
# ─────────────────────────────────────────────────────────────────────────────

RESPONSES = {
    "happy": {
        "acknowledgements": [
            "I love hearing that you're feeling great! 🌟 That's genuinely wonderful.",
            "Your positivity is truly radiant right now! 😊 Hold onto this feeling.",
            "It's so uplifting to know you're in a good place — that energy is contagious! ✨",
            "Joy like this is worth celebrating! Something good is clearly happening for you. 🎉",
        ],
        "reinforcements": [
            "Positive emotions actually build your emotional resilience over time — this isn't just a mood, it's a deposit in your wellbeing bank.",
            "Research shows that savouring happy moments — really sitting with them — multiplies their positive impact on your brain.",
            "This is a great time to reach out to someone you care about. Sharing happiness strengthens your social bonds.",
            "Happy moments are worth anchoring. Try writing down what's making you feel this way so you can revisit it on harder days.",
        ],
        "exercises": [
            "💡 **Gratitude Boost:** Write 3 specific things you're grateful for right now — the more specific, the stronger the effect.",
            "📸 **Happy Anchor:** Take a photo or write a note that captures this feeling so you can look back on it.",
            "🤝 **Share the Joy:** Tell one person what you appreciate about them today. Acts of kindness multiply your own happiness.",
            "🎯 **Momentum:** Use this energy to tackle one thing you've been putting off — positive emotion is your superpower right now!",
        ],
        "closing_lines": [
            "Keep shining! 🌟",
            "You deserve this happiness. 💛",
            "I'm so glad you're feeling this way! 🎊",
        ],
    },

    "sad": {
        "acknowledgements": [
            "I'm really sorry you're feeling this way. Please know that what you're feeling is completely valid, and you're not alone. 💙",
            "Thank you for sharing that with me. It takes courage to acknowledge pain, and I'm honoured you're trusting me with it.",
            "Sadness is a signal that something important to you matters. I'm here with you — you don't have to carry this alone.",
            "I hear you. Whatever you're going through, your feelings are real and they matter. 💜",
            "It's okay to not be okay. You don't have to perform happiness or rush your healing. I'm right here.",
        ],
        "reinforcements": [
            "Emotions are like weather — they pass. You've weathered hard days before, and each one made you more resilient than you know.",
            "Being gentle with yourself right now is the priority. You wouldn't criticise a friend for being sad, so try to extend yourself the same compassion.",
            "Sadness often hides a deeper need — for connection, rest, or meaning. Being curious about what you need, rather than judging how you feel, can help.",
            "Sometimes sadness asks us to slow down and listen to ourselves. What is it that you truly need most right now?",
        ],
        "exercises": [
            "🌬️ **4-7-8 Breathing:** Inhale for 4 seconds → Hold for 7 → Exhale fully for 8. Do this 3 times. It activates your parasympathetic nervous system.",
            "🤗 **Self-Compassion Pause:** Place your hand on your heart. Say softly: *'This is a moment of suffering. Suffering is part of life. May I be kind to myself right now.'*",
            "📝 **Feelings Journal:** Set a 5-minute timer and write without stopping. Don't edit, don't judge — just let the feelings flow out onto the page.",
            "🚶 **Mindful Walk:** Put on comfortable shoes and walk slowly for 10 minutes. Focus on the sensation of your feet touching the ground with each step.",
            "🛁 **Comfort Ritual:** Do one small act of self-care right now — make a warm drink, wrap yourself in a blanket, or put on music you love.",
        ],
        "closing_lines": [
            "I'm right here with you. 💙",
            "You matter, and this will pass. 🌱",
            "Take it one breath at a time. 💜",
        ],
    },

    "angry": {
        "acknowledgements": [
            "I can feel the intensity in what you're sharing. Your anger is valid — it's telling you something important. 🔥",
            "Anger is often a protector — it rises when something we care about feels violated. That makes complete sense.",
            "I hear you. That level of frustration is exhausting to carry. Let's work through this together.",
            "You have every right to feel angry. Let's look at what's underneath it and what you need right now.",
        ],
        "reinforcements": [
            "Anger often masks a hurt or fear beneath it. When you're ready, it can be powerful to explore what's really going on.",
            "The pause between a trigger and your reaction is where your real power lies. Creating even a 5-minute gap can change everything.",
            "You are not your anger. You are the awareness noticing the anger — and in that awareness, you have a choice.",
            "Anger is energy. The question is: what do you want to do with it? Channel it into something constructive and it becomes fuel.",
        ],
        "exercises": [
            "❄️ **Cold Water Reset:** Splash cold water on your face or hold ice cubes — it physically activates your dive reflex and slows your heart rate within 30 seconds.",
            "👊 **Physical Release:** Do 20 jumping jacks, brisk walk around the block, or tense every muscle in your body for 5 seconds then release. Burn the adrenaline physically.",
            "📦 **Box Breathing:** Inhale 4s → Hold 4s → Exhale 4s → Hold 4s. Repeat 4 times. This is used by Navy SEALs to calm under extreme stress.",
            "✍️ **The Unsent Letter:** Write everything you feel in a letter to whoever upset you. Say it all. Then delete or rip it up — not to suppress feelings, but to release them safely.",
            "🕐 **20-Minute Rule:** Set a timer for 20 minutes before responding to whatever triggered you. Your brain's prefrontal cortex needs that time to re-engage after the emotional hijack.",
        ],
        "closing_lines": [
            "You've got this. 💪",
            "Your strength is real. 🌊",
            "One breath at a time. 🔥➡️☁️",
        ],
    },

    "anxious": {
        "acknowledgements": [
            "Anxiety can be so overwhelming — that tight, racing feeling is genuinely uncomfortable, and I'm glad you're talking about it. 💜",
            "I hear the worry in what you're sharing. Anxiety lies to us sometimes, but your experience of it is absolutely real.",
            "That anxious feeling makes complete sense given what you're going through. You don't have to face it alone.",
            "Living with anxiety is exhausting. Thank you for sharing this with me — let's work through it together.",
        ],
        "reinforcements": [
            "Anxiety is your brain's alarm system working overtime. The good news? You can retrain it with practice — calming exercises genuinely rewire your nervous system over time.",
            "When everything feels big and overwhelming, break it into the smallest possible next step. Just one thing. What is the very next tiny action?",
            "Your thoughts are not facts. When the anxious mind says 'what if...', ask yourself: 'What is actually true right now, in this moment?'",
            "The 5-4-3-2-1 technique can bring you back to the present instantly when anxiety pulls you into the future. Would you like to try it now?",
        ],
        "exercises": [
            "🖐️ **5-4-3-2-1 Grounding:** Name 5 things you SEE → 4 you can TOUCH → 3 you HEAR → 2 you SMELL → 1 you TASTE. This anchors you instantly to the present moment.",
            "🌬️ **Diaphragmatic Breathing:** One hand on chest, one on belly. Breathe so only the belly hand rises. In through nose (4s), out through mouth (6s). Do this 5 times.",
            "🧊 **Cold Water Grounding:** Hold your hands under cold water and focus only on that sensation — temperature, pressure, sound. 60 seconds. It interrupts the anxiety cycle.",
            "💪 **Progressive Muscle Relaxation:** Starting at your feet, tense each muscle group for 5 seconds then completely release. Work up to your face. Takes 5 minutes and works remarkably well.",
            "📦 **Worry Containment:** Write your worry on paper, fold it, and put it in a physical 'worry box' (any container). Tell yourself 'I've dealt with this for now' and schedule a specific worry time tomorrow.",
        ],
        "closing_lines": [
            "You are safe right now. 💜",
            "One breath at a time — you've got this. 🌬️",
            "This feeling will pass. I'm right here. 🤗",
        ],
    },

    "neutral": {
        "acknowledgements": [
            "Thanks for checking in! It's wonderful that you're taking time for your wellbeing. 🌱",
            "Feeling balanced and okay is something worth appreciating. How can I support you today?",
            "Stable moments like this are actually a great time to build good habits. What's on your mind?",
            "I'm here for you whether you're having a great day or just an okay one. What would you like to talk about?",
        ],
        "reinforcements": [
            "Neutral moments are the perfect time to invest in your mental resilience — before the hard days hit.",
            "Is there something you've been wanting to explore, work through, or just talk about?",
            "Taking care of your mental health on good days makes the difficult days significantly easier to navigate.",
            "What's one small thing you could do for yourself today?",
        ],
        "exercises": [
            "🧘 **5-Minute Mindfulness:** Set a timer for 5 minutes. Sit comfortably and notice your breath. When your mind wanders (it will!), gently bring it back. That's the practice.",
            "📓 **Reflective Journal Prompt:** Write about: *'What went well today? What am I looking forward to?'* Two minutes of positive reflection shifts brain chemistry.",
            "🌿 **Nature Break:** Step outside for 10 minutes — even just sitting on a step counts. Natural light and fresh air have measurable mood benefits within minutes.",
            "💬 **Connection:** Reach out to one person you care about today. Even a quick 'thinking of you' text strengthens your social wellbeing.",
        ],
        "closing_lines": [
            "I'm here whenever you need me. 🌿",
            "Take good care of yourself today! ☀️",
            "Looking forward to chatting more. 💙",
        ],
    },
}

# ── Crisis Response ────────────────────────────────────────────────────────────
CRISIS_RESPONSE = """🆘 **I'm genuinely concerned about your safety, and you matter deeply to me.**

What you're feeling right now is real, and it's also temporary — even when it doesn't feel that way. **Please reach out to someone right now.**

**📞 Immediate Support Lines (India):**
• **iCall:** 9152987821 *(Mon–Sat, 8am–10pm)*
• **Vandrevala Foundation:** 1860-2662-345 *(24/7)*
• **Snehi:** 044-24640050 *(24/7)*
• **AASRA:** 9820466627 *(24/7)*
• **International:** [findahelpline.com](https://findahelpline.com) — local lines worldwide

**If you're in immediate danger, please call emergency services (112 in India).**

You don't have to feel this way alone. Would you like to tell me what's been happening? I'm here and I'm listening. 💙"""

# ── Worsening mood message ─────────────────────────────────────────────────────
WORSENING_MESSAGE = """I've noticed that you've been expressing difficult feelings across our conversation. 💙

**That takes courage, and I want you to know I'm taking this seriously.**

When emotions are consistently heavy like this, talking to a mental health professional can make a real difference — not because something is wrong with you, but because you deserve proper support.

In the meantime, I'm right here. Would you like to try a breathing exercise or just keep talking?"""

# ── Improving mood message ─────────────────────────────────────────────────────
IMPROVING_MESSAGE_SUFFIX = "\n\n🌱 *I'm noticing a shift in a more positive direction — that's really meaningful progress. Keep going.*"


def _analyse_context(context: list) -> dict:
    """
    Analyse conversation context to detect patterns.
    Returns: { trend, last_emotions, repeat_count }
    """
    if not context:
        return {"trend": "stable", "last_emotions": [], "repeat_count": 0}

    user_messages = [m for m in context if m.get("role") == "user"]
    # We don't have emotion labels in context, so we do keyword analysis
    from models.emotion_classifier import classify_emotion
    emotions = [classify_emotion(m["content"])["emotion"] for m in user_messages[-5:]]

    negative = {"sad", "angry", "anxious"}
    neg_count = sum(1 for e in emotions if e in negative)

    trend = "stable"
    if len(emotions) >= 3:
        if neg_count >= 3:
            trend = "worsening"
        elif neg_count == 0 and len(emotions) > 0:
            trend = "improving"

    return {
        "trend": trend,
        "last_emotions": emotions,
        "repeat_count": neg_count,
    }


def generate_response(
    emotion: str,
    score: float,
    is_crisis: bool,
    text: str,
    context: list = None,
    face_emotion: str = None,
    face_score: float = None,
) -> str:
    """
    Generate a contextually rich, supportive response.

    Args:
        emotion     : Detected (possibly combined) emotion
        score       : Confidence 0.0–1.0
        is_crisis   : Crisis keywords detected
        text        : User's raw message
        context     : List of last N { role, content } messages
        face_emotion: Face-detected emotion (may differ from text)
        face_score  : Face detection confidence
    """
    if is_crisis:
        return CRISIS_RESPONSE

    bank = RESPONSES.get(emotion, RESPONSES["neutral"])

    # ── Context analysis ─────────────────────────────────────────────────────
    ctx_data = _analyse_context(context or [])

    if ctx_data["trend"] == "worsening":
        return WORSENING_MESSAGE

    # ── Build response parts ──────────────────────────────────────────────────
    parts = []

    # 1. Acknowledgement (always)
    parts.append(random.choice(bank["acknowledgements"]))

    # 2. Face emotion note — if face & text differ significantly
    if face_emotion and face_emotion != emotion and face_score and face_score > 0.5:
        from utils.emotions_map import FACE_LABEL_NAMES
        face_label = FACE_LABEL_NAMES.get(face_emotion, face_emotion.title())
        parts.append(
            f"*I also noticed from your expression that you may be feeling {face_label} — "
            f"it's okay if your inside feelings and outside expression don't quite match right now.*"
        )

    # 3. Insight / reinforcement
    parts.append(random.choice(bank["reinforcements"]))

    # 4. Exercise or tip (high probability for distress emotions, lower for happy/neutral)
    include_exercise = score > 0.6 or emotion in ("sad", "anxious", "angry")
    if include_exercise and "exercises" in bank:
        parts.append(random.choice(bank["exercises"]))

    # 5. Closing line
    if "closing_lines" in bank:
        parts.append(random.choice(bank["closing_lines"]))

    # 6. Improving mood encouragement
    if ctx_data["trend"] == "improving":
        parts[-1] += IMPROVING_MESSAGE_SUFFIX

    return "\n\n".join(parts)
