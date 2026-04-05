/**
 * MindEase — Combined Emotion Utilities
 * Maps emotions to display metadata and provides combining logic.
 */

export const EMOTIONS = {
  happy: {
    emoji: '😊', label: 'Happy', color: '#f59e0b',
    bg: 'rgba(245,158,11,0.12)', cssClass: 'badge-happy',
  },
  sad: {
    emoji: '😔', label: 'Sad', color: '#3b82f6',
    bg: 'rgba(59,130,246,0.12)', cssClass: 'badge-sad',
  },
  angry: {
    emoji: '😠', label: 'Angry', color: '#ef4444',
    bg: 'rgba(239,68,68,0.12)', cssClass: 'badge-angry',
  },
  anxious: {
    emoji: '😰', label: 'Anxious', color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.12)', cssClass: 'badge-anxious',
  },
  neutral: {
    emoji: '😐', label: 'Neutral', color: '#6b7280',
    bg: 'rgba(107,114,128,0.12)', cssClass: 'badge-neutral',
  },
  surprised: {
    emoji: '😲', label: 'Surprised', color: '#f59e0b',
    bg: 'rgba(245,158,11,0.12)', cssClass: 'badge-happy',
  },
}

export const getEmotion = (emotion) =>
  EMOTIONS[emotion?.toLowerCase()] ?? EMOTIONS.neutral

export const formatScore = (score) =>
  score != null ? `${Math.round(score * 100)}%` : ''

export const CHART_COLORS = {
  happy: '#f59e0b', sad: '#3b82f6', angry: '#ef4444',
  anxious: '#8b5cf6', neutral: '#6b7280',
}

/**
 * Combine text emotion and face emotion into a single weighted result.
 * When both signals available: 60% text + 40% face.
 * When only text: 100% text.
 * When face is highly confident (>0.85): weight shifts to 50/50.
 *
 * @param {{ emotion, score }} textResult
 * @param {{ emotion, score } | null} faceResult
 * @returns {{ emotion, score, source: 'text'|'face'|'combined' }}
 */
export const combineEmotions = (textResult, faceResult) => {
  if (!faceResult || faceResult.score < 0.3) {
    return { ...textResult, source: 'text' }
  }

  // Both available — weighted merge
  const faceWeight = faceResult.score > 0.85 ? 0.5 : 0.4
  const textWeight = 1 - faceWeight

  if (textResult.emotion === faceResult.emotion) {
    // Same emotion — just average the scores (reinforces confidence)
    return {
      emotion: textResult.emotion,
      score: Math.min(0.99, textResult.score * textWeight + faceResult.score * faceWeight),
      source: 'combined',
    }
  }

  // Different emotions — pick the one with higher weighted score
  const textWeighted = textResult.score * textWeight
  const faceWeighted = faceResult.score * faceWeight

  if (faceWeighted > textWeighted) {
    return { emotion: faceResult.emotion, score: faceResult.score, source: 'face' }
  }
  return { emotion: textResult.emotion, score: textResult.score, source: 'text' }
}

/**
 * Analyse a list of recent emotion strings and detect if mood is worsening.
 * Returns 'worsening' | 'improving' | 'stable'
 */
const NEGATIVE_EMOTIONS = new Set(['sad', 'angry', 'anxious'])
export const detectMoodTrend = (emotionHistory = []) => {
  if (emotionHistory.length < 3) return 'stable'
  const last3 = emotionHistory.slice(-3)
  const negCount = last3.filter(e => NEGATIVE_EMOTIONS.has(e)).length
  const earlierNeg = emotionHistory.slice(0, -3).filter(e => NEGATIVE_EMOTIONS.has(e)).length
  if (negCount === 3) return 'worsening'
  if (negCount === 0 && earlierNeg > 0) return 'improving'
  return 'stable'
}
