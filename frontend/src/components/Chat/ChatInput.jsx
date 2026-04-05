import { useState, useRef, useEffect } from 'react'
import { Send, Mic, MicOff, Smile } from 'lucide-react'

/**
 * Chat input bar with:
 * - Textarea (auto-grow)
 * - Send button
 * - Voice input (Web Speech API)
 * @param {{ onSend, disabled }} props
 */
export default function ChatInput({ onSend, disabled }) {
  const [text, setText] = useState('')
  const [isListening, setIsListening] = useState(false)
  const textareaRef = useRef(null)
  const recognitionRef = useRef(null)

  // ── Auto-resize textarea ────────────────────────────────────────────────────
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px'
  }, [text])

  // ── Handle Submit ───────────────────────────────────────────────────────────
  const handleSend = () => {
    const trimmed = text.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setText('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // ── Voice Input (Web Speech API) ────────────────────────────────────────────
  const toggleVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Voice input is not supported in your browser. Try Chrome.')
      return
    }

    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript
      setText(prev => prev ? `${prev} ${transcript}` : transcript)
    }
    recognition.onend = () => setIsListening(false)
    recognition.onerror = () => setIsListening(false)

    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)
  }

  return (
    <div style={containerStyle}>
      <div style={inputWrapStyle}>
        <textarea
          id="chat-input"
          ref={textareaRef}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Share how you're feeling… (Shift+Enter for new line)"
          disabled={disabled}
          rows={1}
          style={textareaStyle}
          aria-label="Chat message input"
        />

        {/* Voice button */}
        <button
          id="voice-input-btn"
          onClick={toggleVoice}
          disabled={disabled}
          style={{
            ...actionBtnStyle,
            background: isListening ? 'rgba(239,68,68,0.12)' : 'transparent',
            color: isListening ? '#ef4444' : 'var(--text-muted)',
          }}
          title={isListening ? 'Stop listening' : 'Voice input'}
          aria-label="Voice input"
        >
          {isListening ? <MicOff size={19} /> : <Mic size={19} />}
        </button>

        {/* Send button */}
        <button
          id="send-message-btn"
          onClick={handleSend}
          disabled={disabled || !text.trim()}
          style={{
            ...sendBtnStyle,
            opacity: (!text.trim() || disabled) ? 0.5 : 1,
          }}
          aria-label="Send message"
        >
          <Send size={18} />
        </button>
      </div>

      <p style={hintStyle}>
        {isListening ? '🎙️ Listening…' : 'Press Enter to send · Shift+Enter for new line'}
      </p>
    </div>
  )
}

const containerStyle = {
  padding: '0.75rem 1rem',
  borderTop: '1px solid var(--glass-border)',
  background: 'var(--surface)',
}
const inputWrapStyle = {
  display: 'flex', alignItems: 'flex-end', gap: '0.5rem',
  background: 'var(--surface-alt)',
  borderRadius: 'var(--radius-lg)',
  padding: '0.4rem 0.5rem 0.4rem 1rem',
  border: '2px solid var(--glass-border)',
  transition: 'var(--transition-base)',
}
const textareaStyle = {
  flex: 1, border: 'none', outline: 'none', resize: 'none',
  background: 'transparent', color: 'var(--text)',
  fontSize: '0.95rem', lineHeight: 1.5,
  maxHeight: '120px', overflowY: 'auto',
  fontFamily: 'inherit',
  padding: '0.3rem 0',
}
const actionBtnStyle = {
  width: 36, height: 36, borderRadius: '50%', border: 'none',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', transition: 'var(--transition-base)', flexShrink: 0,
}
const sendBtnStyle = {
  width: 40, height: 40, borderRadius: '50%', border: 'none', flexShrink: 0,
  background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
  color: 'white', cursor: 'pointer', transition: 'var(--transition-base)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  boxShadow: '0 3px 12px rgba(99,102,241,0.4)',
}
const hintStyle = {
  fontSize: '0.72rem', color: 'var(--text-muted)',
  textAlign: 'center', marginTop: '0.35rem',
}
