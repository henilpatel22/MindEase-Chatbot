export default function TypingIndicator() {
  return (
    <div style={wrapStyle} className="animate-fade-in">
      <div style={avatarStyle}>🤖</div>
      <div style={bubbleStyle}>
        <div style={{ display:'flex', gap:'5px', alignItems:'center', padding:'2px 0' }}>
          <div className="typing-dot" />
          <div className="typing-dot" />
          <div className="typing-dot" />
        </div>
      </div>
    </div>
  )
}

const wrapStyle = {
  display: 'flex', alignItems: 'flex-end', gap: '0.6rem',
  padding: '0.4rem 0',
}
const avatarStyle = {
  width: 32, height: 32, borderRadius: '50%',
  background: 'linear-gradient(135deg,rgba(99,102,241,0.15),rgba(139,92,246,0.15))',
  border: '1px solid var(--glass-border)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: '1rem', flexShrink: 0,
}
const bubbleStyle = {
  background: 'var(--gradient-bot-bubble)',
  border: '1px solid var(--glass-border)',
  borderRadius: '20px 20px 20px 4px',
  padding: '0.65rem 1rem',
  boxShadow: 'var(--shadow-sm)',
}
