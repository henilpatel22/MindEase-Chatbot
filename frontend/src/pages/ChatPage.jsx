import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { chatAPI } from '../api/chat'
import Navbar from '../components/Common/Navbar'
import SOSButton from '../components/Common/SOSButton'
import ChatBubble from '../components/Chat/ChatBubble'
import ChatInput from '../components/Chat/ChatInput'
import TypingIndicator from '../components/Chat/TypingIndicator'
import FaceDetector from '../components/Chat/FaceDetector'
import BreathingExercise from '../components/Chat/BreathingExercise'
import QuickReplies from '../components/Chat/QuickReplies'
import {
  Brain, Trash2, PlusCircle, Clock, ChevronRight,
  Volume2, VolumeX, Wind, Camera, BarChart2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { getEmotion, combineEmotions, detectMoodTrend } from '../utils/emotions'
import EmotionBadge from '../components/Chat/EmotionBadge'

// ── Text-to-speech helper ─────────────────────────────────────────────────────
const speak = (text, enabled) => {
  if (!enabled || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const clean = text.replace(/[#*_~`]/g, '').replace(/\n+/g, ' ').slice(0, 400)
  const utt = new SpeechSynthesisUtterance(clean)
  utt.rate = 0.92
  utt.pitch = 1.05
  // Prefer a softer voice if available
  const voices = window.speechSynthesis.getVoices()
  const preferred = voices.find(v => /female|samantha|karen|victoria/i.test(v.name))
  if (preferred) utt.voice = preferred
  window.speechSynthesis.speak(utt)
}

export default function ChatPage() {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [conversationId, setConversationId] = useState(null)
  const [isTyping, setIsTyping] = useState(false)
  const [history, setHistory] = useState([])
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [cameraOpen, setCameraOpen] = useState(false)

  // ── Emotion state ───────────────────────────────────────────────────────────
  const [textEmotion, setTextEmotion] = useState(null)     // { emotion, score }
  const [faceEmotion, setFaceEmotion] = useState(null)     // { emotion, score } from camera
  const [combinedEmotion, setCombinedEmotion] = useState(null)
  const [emotionHistory, setEmotionHistory] = useState([]) // list of emotion strings in session

  // ── Feature toggles ─────────────────────────────────────────────────────────
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [showBreathing, setShowBreathing] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)

  const bottomRef = useRef(null)
  const pendingTextRef = useRef('')

  // ── Auto-scroll ─────────────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Load history and set default mobile state
  useEffect(() => { 
    loadHistory() 
    if (window.innerWidth < 768) {
      setSidebarOpen(false)
    }
  }, [])

  // ── Update combined emotion whenever text or face changes ───────────────────
  useEffect(() => {
    if (!textEmotion) return
    const combined = combineEmotions(textEmotion, cameraActive ? faceEmotion : null)
    setCombinedEmotion(combined)
    setEmotionHistory(prev => [...prev, combined.emotion])
  }, [textEmotion, faceEmotion, cameraActive])

  // ── Auto-trigger breathing exercise for severe anxiety ─────────────────────
  useEffect(() => {
    if (
      combinedEmotion?.emotion === 'anxious' &&
      combinedEmotion?.score > 0.82 &&
      !showBreathing
    ) {
      toast('😰 High anxiety detected — try a breathing exercise?', {
        icon: '🌬️',
        action: { label: 'Start', onClick: () => setShowBreathing(true) },
        duration: 6000,
      })
    }
  }, [combinedEmotion])

  // ── Mood deterioration warning ──────────────────────────────────────────────
  useEffect(() => {
    const trend = detectMoodTrend(emotionHistory)
    if (trend === 'worsening' && emotionHistory.length >= 3) {
      toast.error(
        '💙 Your mood seems to be declining. Please consider speaking to a professional or using the SOS button.',
        { duration: 8000 }
      )
    }
  }, [emotionHistory])

  const loadHistory = async () => {
    try {
      const res = await chatAPI.getHistory()
      setHistory(res.data.conversations || [])
    } catch { /* silent */ }
  }

  // ── Get last N context messages for the AI ──────────────────────────────────
  const buildContext = (msgs) =>
    msgs.slice(-6).map(m => ({ role: m.role, content: m.content }))

  // ── Send message ────────────────────────────────────────────────────────────
  const handleSend = async (text) => {
    const userMsg = {
      role: 'user', content: text,
      emotion: null, emotionScore: null,
      timestamp: new Date().toISOString(),
    }
    setMessages(prev => [...prev, userMsg])
    setIsTyping(true)
    pendingTextRef.current = text

    try {
      const payload = {
        message: text,
        conversationId,
        context: buildContext(messages),
        faceEmotion: cameraActive && faceEmotion ? faceEmotion.emotion : null,
        faceEmotionScore: cameraActive && faceEmotion ? faceEmotion.score : null,
      }

      const res = await chatAPI.sendMessage(payload)
      const { userMessage, botMessage, conversationId: cId } = res.data

      setConversationId(cId)

      // Update local text emotion
      if (userMessage.emotion) {
        setTextEmotion({ emotion: userMessage.emotion, score: userMessage.emotionScore })
      }

      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = { ...userMsg, ...userMessage }
        return [...updated, { ...botMessage, timestamp: botMessage.timestamp || new Date().toISOString() }]
      })

      // TTS
      speak(botMessage.content, voiceEnabled)

      // Crisis alert
      if (res.data.isCrisis) {
        toast.error('⚠️ We noticed something concerning. Please use the SOS button.', { duration: 8000 })
      }

      loadHistory()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to send message')
      setMessages(prev => prev.slice(0, -1))
    } finally {
      setIsTyping(false)
    }
  }

  const handleNewChat = () => {
    setMessages([])
    setConversationId(null)
    setTextEmotion(null)
    setCombinedEmotion(null)
    setEmotionHistory([])
    window.speechSynthesis?.cancel()
  }

  const loadConversation = async (conv) => {
    try {
      const res = await chatAPI.getConversation(conv._id)
      setMessages(res.data.conversation.messages)
      setConversationId(conv._id)
    } catch { toast.error('Failed to load conversation') }
  }

  const handleClearHistory = async () => {
    if (!window.confirm('Clear all chat history? This cannot be undone.')) return
    try {
      await chatAPI.clearHistory()
      setHistory([])
      handleNewChat()
      toast.success('Chat history cleared')
    } catch { toast.error('Failed to clear history') }
  }

  const handleFaceEmotion = useCallback((result) => {
    setFaceEmotion(result)
  }, [])

  const handleQuickReply = (text) => {
    handleSend(text)
  }

  const showWelcome = messages.length === 0
  const currentEmotion = combinedEmotion?.emotion || textEmotion?.emotion || 'neutral'

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', overflow:'hidden' }}>
      <Navbar />

      <div style={{ display:'flex', flex:1, overflow:'hidden' }}>
        {/* ── Sidebar (history) ─────────────────────────────────── */}
        <aside className="chat-sidebar" style={{
          ...sidebarStyle,
          width: sidebarOpen ? '240px' : '0',
          minWidth: sidebarOpen ? '240px' : '0',
          opacity: sidebarOpen ? 1 : 0,
          overflow: 'hidden',
          transition: 'all 0.3s ease',
        }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.75rem' }}>
            <span style={sectionLabel}>Conversations</span>
            <div style={{ display:'flex', gap:'0.3rem' }}>
              <button id="new-chat-btn" onClick={handleNewChat} style={sideIconBtn} title="New chat">
                <PlusCircle size={15} />
              </button>
              {history.length > 0 && (
                <button id="clear-history-btn" onClick={handleClearHistory} style={{ ...sideIconBtn, color:'#ef4444' }} title="Clear">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Conversation list */}
          <div style={{ display:'flex', flexDirection:'column', gap:'0.25rem', overflowY:'auto', flex:1 }}>
            {history.length === 0 ? (
              <p style={{ fontSize:'0.78rem', color:'var(--text-muted)', textAlign:'center', marginTop:'1.5rem' }}>No conversations yet</p>
            ) : history.map(conv => (
              <button key={conv._id} onClick={() => loadConversation(conv)} style={{
                ...historyItemStyle,
                background: conv._id === conversationId ? 'rgba(99,102,241,0.1)' : 'transparent',
                color: conv._id === conversationId ? 'var(--primary)' : 'var(--text-secondary)',
              }}>
                <Clock size={12} color="var(--text-muted)" style={{ flexShrink:0 }} />
                <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontSize:'0.8rem' }}>{conv.title}</span>
              </button>
            ))}
          </div>

          {/* Session emotion heat strip */}
          {emotionHistory.length > 0 && (
            <div style={{ marginTop:'auto', paddingTop:'0.75rem', borderTop:'1px solid var(--glass-border)' }}>
              <span style={{ ...sectionLabel, display:'block', marginBottom:'0.4rem' }}>Session Mood</span>
              <div style={{ display:'flex', gap:'2px', flexWrap:'wrap' }}>
                {emotionHistory.slice(-16).map((em, i) => (
                  <div
                    key={i}
                    title={em}
                    style={{
                      width:14, height:14, borderRadius:3,
                      background: getEmotion(em).color,
                      opacity: 0.5 + (i / 16) * 0.5,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* ── Main chat ────────────────────────────────────────── */}
        <main className="chat-main" style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0, position:'relative' }}>
          {/* Chat header */}
          <div style={chatHeaderStyle}>
            <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
              <button style={sideIconBtn} onClick={() => setSidebarOpen(!sidebarOpen)} title="Toggle sidebar">
                <ChevronRight size={16} style={{ transform: sidebarOpen ? 'rotate(180deg)' : 'none', transition:'transform 0.3s' }} />
              </button>
              <div style={botAvatarStyle}><Brain size={15} color="#6366f1" /></div>
              <div>
                <p style={{ fontWeight:700, fontSize:'0.875rem', color:'var(--text)', margin:0 }}>MindEase Bot</p>
                <p style={{ fontSize:'0.7rem', color:'#10b981', margin:0 }}>● Online • AI-Powered</p>
              </div>
            </div>

            {/* Right controls */}
            <div style={{ display:'flex', gap:'0.4rem', alignItems:'center' }}>
              {/* Combined emotion badge */}
              {combinedEmotion && (
                <div style={{ display:'flex', alignItems:'center', gap:'0.4rem' }}>
                  <EmotionBadge emotion={combinedEmotion.emotion} score={combinedEmotion.score} />
                  {combinedEmotion.source === 'combined' && (
                    <span style={{ fontSize:'0.65rem', color:'var(--text-muted)', background:'var(--surface-alt)', padding:'1px 6px', borderRadius:'var(--radius-full)' }}>
                      text+face
                    </span>
                  )}
                </div>
              )}

              {/* Voice toggle */}
              <button
                id="voice-output-toggle"
                onClick={() => { setVoiceEnabled(v => !v); window.speechSynthesis?.cancel() }}
                style={{ ...sideIconBtn, color: voiceEnabled ? 'var(--primary)' : 'var(--text-muted)', background: voiceEnabled ? 'rgba(99,102,241,0.12)' : 'var(--surface-alt)' }}
                title={voiceEnabled ? 'Disable voice output' : 'Enable voice output'}
              >
                {voiceEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
              </button>

              {/* Breathing exercise */}
              <button
                id="breathing-btn"
                onClick={() => setShowBreathing(true)}
                style={{ ...sideIconBtn, background:'rgba(16,185,129,0.1)', color:'#10b981' }}
                title="Start breathing exercise"
              >
                <Wind size={15} />
              </button>

              {/* Camera toggle */}
              <button
                id="camera-panel-toggle"
                onClick={() => setCameraOpen(!cameraOpen)}
                style={{ ...sideIconBtn, background: cameraOpen ? 'rgba(99,102,241,0.12)' : 'var(--surface-alt)', color: cameraOpen ? 'var(--primary)' : 'var(--text-muted)' }}
                title="Toggle face detection"
              >
                <Camera size={15} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="chat-messages-container" style={{ flex:1, padding:'1rem 1.25rem', display:'flex', flexDirection:'column', gap:'0.2rem' }}>
            {showWelcome && <WelcomeMessage username={user?.username} />}
            {messages.map((msg, i) => <ChatBubble key={i} message={msg} />)}
            {isTyping && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>

          {/* Quick replies */}
          <QuickReplies emotion={currentEmotion} onSelect={handleQuickReply} />

          {/* Input */}
          <ChatInput onSend={handleSend} disabled={isTyping} />
        </main>

        {/* ── Face Detector Panel (right) ──────────────────────── */}
        {cameraOpen && (
          <aside className="chat-camera-panel" style={{
            width: '220px', minWidth: '220px',
            borderLeft: '1px solid var(--glass-border)',
            display: 'flex', flexDirection: 'column',
            background: 'var(--surface)',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
          }}>
            <FaceDetector
              onEmotionDetected={handleFaceEmotion}
              onToggle={setCameraActive}
            />

            {/* Face + text emotion comparison */}
            {faceEmotion && textEmotion && (
              <div style={{ padding:'0.75rem', borderTop:'1px solid var(--glass-border)' }}>
                <p style={{ fontSize:'0.72rem', color:'var(--text-muted)', marginBottom:'0.5rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em' }}>
                  Signal Sources
                </p>
                <div style={{ display:'flex', flexDirection:'column', gap:'0.35rem' }}>
                  <SignalRow label="📝 Text" emotion={textEmotion.emotion} score={textEmotion.score} />
                  <SignalRow label="📷 Face" emotion={faceEmotion.emotion} score={faceEmotion.score} />
                  {combinedEmotion && <SignalRow label="🧠 Combined" emotion={combinedEmotion.emotion} score={combinedEmotion.score} bold />}
                </div>
              </div>
            )}
          </aside>
        )}
      </div>

      {/* Modals */}
      {showBreathing && <BreathingExercise onClose={() => setShowBreathing(false)} />}
      <SOSButton />
    </div>
  )
}

// ── Helper sub-components ─────────────────────────────────────────────────────
function WelcomeMessage({ username }) {
  const prompts = [
    "How are you feeling right now?",
    "What's been occupying your mind lately?",
    "Tell me about your day — I'm here to listen 💙",
    "Need to vent, get advice, or just talk?",
  ]
  return (
    <div style={{ textAlign:'center', padding:'2rem 1rem', animation:'fadeIn 0.5s ease' }}>
      <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>🤖</div>
      <h2 style={{ fontSize:'1.2rem', marginBottom:'0.4rem' }}>Hi, {username || 'there'}! 👋</h2>
      <p style={{ color:'var(--text-muted)', fontSize:'0.875rem', marginBottom:'1.25rem', maxWidth:360, margin:'0 auto 1.25rem' }}>
        I'm MindEase — your safe, judgment-free companion. I detect emotions from your words
        and can also read your facial expressions via camera.
      </p>
      <div style={{ display:'flex', flexDirection:'column', gap:'0.4rem', maxWidth:340, margin:'0 auto' }}>
        {prompts.map(p => (
          <div key={p} style={{ background:'var(--surface-alt)', border:'1px solid var(--glass-border)', borderRadius:'var(--radius-full)', padding:'0.45rem 1rem', fontSize:'0.82rem', color:'var(--text-secondary)' }}>
            {p}
          </div>
        ))}
      </div>
    </div>
  )
}

function SignalRow({ label, emotion, score, bold }) {
  const meta = getEmotion(emotion)
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
      <span style={{ fontSize:'0.74rem', color:'var(--text-muted)', fontWeight: bold ? 700 : 400 }}>{label}</span>
      <span style={{ fontSize:'0.74rem', fontWeight:700, color: meta.color }}>
        {meta.emoji} {meta.label} {Math.round(score * 100)}%
      </span>
    </div>
  )
}

// ── Styles ───────────────────────────────────────────────────────────────────
const sidebarStyle = {
  background: 'var(--surface)', borderRight: '1px solid var(--glass-border)',
  display: 'flex', flexDirection: 'column', padding: '0.85rem',
}
const sectionLabel = {
  fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)',
  textTransform: 'uppercase', letterSpacing: '0.08em',
}
const sideIconBtn = {
  width: 30, height: 30, borderRadius: 8, border: 'none',
  background: 'var(--surface-alt)', color: 'var(--text-muted)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', flexShrink: 0, transition: 'var(--transition-base)',
}
const historyItemStyle = {
  display: 'flex', alignItems: 'center', gap: '0.4rem',
  padding: '0.45rem 0.55rem', borderRadius: 'var(--radius-md)',
  border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left',
  transition: 'var(--transition-base)',
}
const chatHeaderStyle = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem',
  padding: '0.6rem 1rem',
  borderBottom: '1px solid var(--glass-border)',
  background: 'var(--surface)', flexWrap: 'wrap',
}
const botAvatarStyle = {
  width: 32, height: 32, borderRadius: '50%',
  background: 'linear-gradient(135deg,rgba(99,102,241,0.12),rgba(139,92,246,0.12))',
  border: '1.5px solid rgba(99,102,241,0.3)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
}
