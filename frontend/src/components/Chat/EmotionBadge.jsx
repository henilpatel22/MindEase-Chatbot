import { getEmotion, formatScore } from '../../utils/emotions'

/**
 * Displays the detected emotion as a coloured emoji badge.
 * @param {string}  emotion   - e.g. 'happy', 'sad'
 * @param {number}  score     - confidence 0–1
 * @param {boolean} compact   - show only emoji when true
 */
export default function EmotionBadge({ emotion, score, compact = false }) {
  if (!emotion) return null
  const meta = getEmotion(emotion)

  return (
    <span
      className={`badge ${meta.cssClass} animate-fade-in`}
      title={`${meta.label} (${formatScore(score)} confidence)`}
      style={{ userSelect: 'none' }}
    >
      <span>{meta.emoji}</span>
      {!compact && <span>{meta.label}</span>}
      {!compact && score != null && (
        <span style={{ opacity: 0.65, fontSize:'0.7rem' }}>{formatScore(score)}</span>
      )}
    </span>
  )
}
