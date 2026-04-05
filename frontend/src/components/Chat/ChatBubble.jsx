import EmotionBadge from './EmotionBadge'
import { Brain } from 'lucide-react'

/**
 * Renders a single chat message bubble (user or bot).
 * @param {{ role, content, emotion, emotionScore, timestamp }} message
 */
export default function ChatBubble({ message }) {
  const isUser = message.role === 'user'
  const timeStr = message.timestamp
    ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : ''

  if (isUser) {
    return (
      <div style={userWrapStyle} className="animate-fade-in">
        <div style={userInnerStyle}>
          {/* Emotion badge above bubble */}
          {message.emotion && (
            <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:'0.3rem' }}>
              <EmotionBadge emotion={message.emotion} score={message.emotionScore} />
            </div>
          )}
          <div className="chat-bubble-user">
            {message.content}
          </div>
          <span style={timeStyle}>{timeStr}</span>
        </div>
      </div>
    )
  }

  // Bot bubble
  return (
    <div style={botWrapStyle} className="animate-fade-in">
      {/* Bot avatar */}
      <div style={botAvatarStyle}>
        <Brain size={16} color="#6366f1" />
      </div>

      <div style={botInnerStyle}>
        <span style={{ fontSize:'0.72rem', color:'var(--text-muted)', marginBottom:'0.25rem', fontWeight:600 }}>
          MindEase Bot
        </span>
        <div className="chat-bubble-bot" style={{ whiteSpace:'pre-wrap' }}>
          {message.content}
        </div>
        <span style={timeStyle}>{timeStr}</span>
      </div>
    </div>
  )
}

const userWrapStyle = {
  display: 'flex', justifyContent: 'flex-end',
  padding: '0.35rem 0',
}
const userInnerStyle = {
  display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
  maxWidth: 'var(--bubble-max)',
}
const botWrapStyle = {
  display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
  padding: '0.35rem 0',
}
const botAvatarStyle = {
  width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
  background: 'linear-gradient(135deg,rgba(99,102,241,0.12),rgba(139,92,246,0.12))',
  border: '1.5px solid rgba(99,102,241,0.3)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  marginTop: '1.2rem',
}
const botInnerStyle = {
  display: 'flex', flexDirection: 'column',
  maxWidth: 'var(--bubble-max)',
}
const timeStyle = {
  fontSize: '0.7rem', color: 'var(--text-muted)',
  marginTop: '0.25rem', padding: '0 0.25rem',
}
