import { Link } from 'react-router-dom'
import { Brain, MessageCircle, BarChart2, Shield, Heart, Zap, Star } from 'lucide-react'

const FEATURES = [
  { icon: <Brain size={24} color="#6366f1" />, title: 'Emotion Detection', desc: 'AI analyses your words to detect emotions — happy, sad, angry, anxious — in real time.' },
  { icon: <MessageCircle size={24} color="#10b981" />, title: 'Supportive Chat', desc: 'Get personalised coping strategies, breathing exercises, and motivational support.' },
  { icon: <BarChart2 size={24} color="#8b5cf6" />, title: 'Mood Dashboard', desc: 'Track your emotional patterns with beautiful mood trend charts over days and weeks.' },
  { icon: <Shield size={24} color="#f59e0b" />, title: 'Crisis Support', desc: 'Auto-detects crisis situations and instantly surfaces helpline numbers.' },
  { icon: <Zap size={24} color="#ef4444" />, title: 'Voice Input', desc: 'Speak your thoughts — voice-to-text powered by Web Speech API.' },
  { icon: <Star size={24} color="#10b981" />, title: 'Secure & Private', desc: 'Your conversations are encrypted and stored securely, visible only to you.' },
]

const EMOTIONS = [
  { emoji: '😊', label: 'Happy', color: '#f59e0b' },
  { emoji: '😔', label: 'Sad', color: '#3b82f6' },
  { emoji: '😠', label: 'Angry', color: '#ef4444' },
  { emoji: '😰', label: 'Anxious', color: '#8b5cf6' },
  { emoji: '😐', label: 'Neutral', color: '#6b7280' },
]

export default function Landing() {
  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column' }}>
      {/* ── Navbar ─────────────────────────────────────────────────── */}
      <nav style={navStyle}>
        <div style={{ display:'flex', alignItems:'center', gap:'0.6rem' }}>
          <div style={logoIconStyle}><Brain size={20} color="white" /></div>
          <span style={logoTextStyle}>MindEase</span>
        </div>
        <div style={{ display:'flex', gap:'0.75rem' }}>
          <Link to="/login" className="btn btn-ghost" style={{ padding:'0.5rem 1.1rem' }}>Sign In</Link>
          <Link to="/register" className="btn btn-primary" style={{ padding:'0.5rem 1.25rem' }}>Get Started</Link>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section style={heroStyle}>
        {/* Decorative blobs */}
        <div style={blob1Style} />
        <div style={blob2Style} />

        <div style={{ position:'relative', zIndex:1, textAlign:'center', maxWidth:'780px', margin:'0 auto', padding:'0 1.5rem' }}>
          <div style={pillBadgeStyle}>
            <Heart size={14} color="#ef4444" fill="#ef4444" />
            <span>AI-powered mental health support</span>
          </div>

          <h1 style={heroTitleStyle}>
            Your compassionate<br />
            <span style={{ background:'linear-gradient(135deg,#6366f1,#8b5cf6,#10b981)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              mental wellness companion
            </span>
          </h1>

          <p style={heroSubStyle}>
            MindEase detects your emotions, listens without judgment, and provides personalised coping
            strategies — 24/7, completely private.
          </p>

          {/* Emotion row */}
          <div style={{ display:'flex', justifyContent:'center', gap:'0.65rem', flexWrap:'wrap', margin:'2rem 0' }}>
            {EMOTIONS.map(e => (
              <div key={e.label} style={{ ...emotionChipStyle, borderColor: e.color }}>
                <span>{e.emoji}</span>
                <span style={{ color: e.color, fontWeight:600, fontSize:'0.8rem' }}>{e.label}</span>
              </div>
            ))}
          </div>

          <div style={{ display:'flex', gap:'1rem', justifyContent:'center', flexWrap:'wrap' }}>
            <Link to="/register" className="btn btn-primary" style={{ padding:'0.8rem 2rem', fontSize:'1rem' }} id="hero-cta-btn">
              Start for Free
            </Link>
            <Link to="/login" className="btn btn-secondary" style={{ padding:'0.8rem 1.75rem', fontSize:'1rem' }}>
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────── */}
      <section style={{ padding:'5rem 1.5rem', maxWidth:'1100px', margin:'0 auto', width:'100%' }}>
        <h2 style={{ textAlign:'center', fontSize:'2rem', marginBottom:'0.75rem' }}>Everything you need to feel better</h2>
        <p style={{ textAlign:'center', color:'var(--text-muted)', marginBottom:'3rem' }}>
          Smart, empathetic tools built for your mental wellness journey
        </p>
        <div style={featureGridStyle}>
          {FEATURES.map(f => (
            <div key={f.title} style={featureCardStyle} className="card">
              <div style={featureIconWrapStyle}>{f.icon}</div>
              <h3 style={{ fontSize:'1rem', fontWeight:700, marginBottom:'0.4rem' }}>{f.title}</h3>
              <p style={{ fontSize:'0.875rem', color:'var(--text-muted)', lineHeight:1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ─────────────────────────────────────────────── */}
      <section style={ctaBannerStyle}>
        <h2 style={{ fontSize:'1.8rem', color:'white', marginBottom:'0.75rem', textAlign:'center' }}>
          Ready to start your wellness journey?
        </h2>
        <p style={{ color:'rgba(255,255,255,0.75)', marginBottom:'2rem', textAlign:'center' }}>
          Join thousands finding support, clarity, and peace with MindEase.
        </p>
        <Link to="/register" className="btn" style={{ background:'white', color:'#6366f1', padding:'0.9rem 2.5rem', fontSize:'1rem', fontWeight:700 }}>
          Get Started — It's Free
        </Link>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer style={{ textAlign:'center', padding:'2rem 1rem', color:'var(--text-muted)', fontSize:'0.8rem' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem', marginBottom:'0.5rem' }}>
          <Brain size={14} color="#6366f1" />
          <span style={{ fontWeight:700, color:'var(--primary)' }}>MindEase</span>
        </div>
        <p>Built with ❤️ to support mental wellness. Not a substitute for professional care.</p>
      </footer>
    </div>
  )
}

// Styles
const navStyle = {
  display:'flex', alignItems:'center', justifyContent:'space-between',
  padding:'1rem 2rem', borderBottom:'1px solid var(--glass-border)',
  background:'var(--glass)', backdropFilter:'blur(20px)', position:'sticky', top:0, zIndex:100,
}
const logoIconStyle = { width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center' }
const logoTextStyle = { fontSize:'1.1rem', fontWeight:800, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }
const heroStyle = { position:'relative', overflow:'hidden', padding:'5rem 1.5rem 4rem', textAlign:'center' }
const blob1Style = { position:'absolute', top:'-100px', left:'-100px', width:'400px', height:'400px', borderRadius:'50%', background:'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)', filter:'blur(60px)', pointerEvents:'none' }
const blob2Style = { position:'absolute', bottom:'-80px', right:'-80px', width:'350px', height:'350px', borderRadius:'50%', background:'radial-gradient(circle, rgba(16,185,129,0.2) 0%, transparent 70%)', filter:'blur(60px)', pointerEvents:'none' }
const pillBadgeStyle = { display:'inline-flex', alignItems:'center', gap:'0.4rem', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:'var(--radius-full)', padding:'0.35rem 1rem', fontSize:'0.8rem', fontWeight:600, color:'#ef4444', marginBottom:'1.5rem' }
const heroTitleStyle = { fontSize:'clamp(2rem, 5vw, 3.2rem)', fontWeight:800, lineHeight:1.2, marginBottom:'1.25rem' }
const heroSubStyle = { fontSize:'1.05rem', color:'var(--text-secondary)', lineHeight:1.7, maxWidth:'600px', margin:'0 auto' }
const emotionChipStyle = { display:'flex', alignItems:'center', gap:'0.35rem', padding:'0.4rem 0.9rem', borderRadius:'var(--radius-full)', background:'var(--surface)', border:'1.5px solid', boxShadow:'var(--shadow-sm)' }
const featureGridStyle = { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:'1.25rem' }
const featureCardStyle = { transition:'var(--transition-base)', cursor:'default' }
const featureIconWrapStyle = { width:48, height:48, borderRadius:14, background:'var(--surface-alt)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'1rem', boxShadow:'var(--shadow-sm)' }
const ctaBannerStyle = { margin:'3rem 1.5rem', borderRadius:'var(--radius-xl)', background:'linear-gradient(135deg,#6366f1,#8b5cf6)', padding:'4rem 2rem', display:'flex', flexDirection:'column', alignItems:'center' }
