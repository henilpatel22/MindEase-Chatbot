/**
 * QuickReplies — Emotion-contextual suggested messages shown above the chat input.
 * Clicking a chip fills the message box for the user.
 */

const QUICK_REPLIES = {
  anxious: [
    "Help me calm down right now",
    "I feel overwhelmed and don't know what to do",
    "Can you guide me through a breathing exercise?",
    "My anxiety is really bad today",
    "What's the fastest way to reduce panic?",
  ],
  sad: [
    "I've been feeling really down lately",
    "Everything feels hopeless right now",
    "I feel very lonely and isolated",
    "Tell me something that might help",
    "I've been crying a lot today",
  ],
  angry: [
    "I'm so frustrated I can't think straight",
    "Help me calm my anger",
    "How do I stop being so reactive?",
    "Everything is making me irritated today",
    "I need a way to release this tension",
  ],
  happy: [
    "I'm feeling great today! Share a tip",
    "What can I do to make the most of this mood?",
    "Help me preserve this positive feeling",
    "I want to channel this energy wisely",
  ],
  neutral: [
    "I want to do a quick mental check-in",
    "Share a daily mental health tip",
    "How can I improve my emotional resilience?",
    "What's a good mindfulness practice?",
    "Help me understand my emotions better",
  ],
}

export default function QuickReplies({ emotion = 'neutral', onSelect }) {
  const replies = QUICK_REPLIES[emotion] ?? QUICK_REPLIES.neutral

  return (
    <div style={containerStyle}>
      <div style={{ display:'flex', gap:'0.4rem', overflowX:'auto', paddingBottom:'0.25rem' }}>
        {replies.slice(0, 4).map((reply, i) => (
          <button
            key={i}
            id={`quick-reply-${i}`}
            onClick={() => onSelect(reply)}
            style={chipStyle}
            title={reply}
          >
            {reply.length > 38 ? reply.slice(0, 38) + '…' : reply}
          </button>
        ))}
      </div>
    </div>
  )
}

const containerStyle = {
  padding: '0.4rem 1rem 0',
  borderTop: '1px solid var(--glass-border)',
  background: 'var(--surface)',
  overflowX: 'hidden',
}
const chipStyle = {
  flexShrink: 0, whiteSpace: 'nowrap',
  padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-full)',
  border: '1.5px solid var(--glass-border)',
  background: 'var(--surface-alt)', color: 'var(--text-secondary)',
  fontSize: '0.78rem', fontWeight: 500, cursor: 'pointer',
  transition: 'var(--transition-base)', fontFamily: 'inherit',
}
