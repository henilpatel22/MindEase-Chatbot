import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Brain, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) { toast.error('Please fill in all fields'); return }
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Welcome back! 💚')
      navigate('/chat')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={pageStyle}>
      {/* Background blobs */}
      <div style={blob1} /><div style={blob2} />

      <div style={cardStyle} className="animate-slide-up">
        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:'2rem' }}>
          <div style={logoStyle}><Brain size={24} color="white" /></div>
          <h1 style={{ fontSize:'1.6rem', marginTop:'1rem', marginBottom:'0.4rem' }}>Welcome back</h1>
          <p style={{ color:'var(--text-muted)', fontSize:'0.9rem' }}>Sign in to continue your wellness journey</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'1.1rem' }}>
          {/* Email */}
          <div className="form-group">
            <label htmlFor="email-input" className="form-label">Email</label>
            <div style={inputWrapStyle}>
              <Mail size={16} color="var(--text-muted)" style={{ flexShrink:0 }} />
              <input
                id="email-input"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                style={inputInnerStyle}
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="password-input" className="form-label">Password</label>
            <div style={inputWrapStyle}>
              <Lock size={16} color="var(--text-muted)" style={{ flexShrink:0 }} />
              <input
                id="password-input"
                type={showPw ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                style={inputInnerStyle}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                style={iconBtnStyle}
                aria-label="Toggle password visibility"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ marginTop:'0.5rem', padding:'0.75rem', fontSize:'0.95rem' }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign:'center', marginTop:'1.5rem', fontSize:'0.875rem', color:'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color:'var(--primary)', fontWeight:600 }}>Create one</Link>
        </p>
      </div>
    </div>
  )
}

const pageStyle = { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'1.5rem', position:'relative', overflow:'hidden' }
const blob1 = { position:'fixed', top:'-120px', left:'-120px', width:'500px', height:'500px', borderRadius:'50%', background:'radial-gradient(circle, rgba(99,102,241,0.2), transparent 70%)', filter:'blur(80px)', pointerEvents:'none' }
const blob2 = { position:'fixed', bottom:'-80px', right:'-80px', width:'400px', height:'400px', borderRadius:'50%', background:'radial-gradient(circle, rgba(16,185,129,0.15), transparent 70%)', filter:'blur(80px)', pointerEvents:'none' }
const cardStyle = { background:'var(--surface)', borderRadius:'var(--radius-xl)', boxShadow:'var(--shadow-lg)', padding:'2.5rem', width:'100%', maxWidth:'420px', position:'relative', zIndex:1, border:'1px solid var(--glass-border)' }
const logoStyle = { width:56, height:56, borderRadius:16, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto', boxShadow:'0 8px 24px rgba(99,102,241,0.4)' }
const inputWrapStyle = { display:'flex', alignItems:'center', gap:'0.6rem', background:'var(--surface-alt)', border:'2px solid var(--glass-border)', borderRadius:'var(--radius-md)', padding:'0.65rem 0.9rem', transition:'var(--transition-base)' }
const inputInnerStyle = { flex:1, border:'none', outline:'none', background:'transparent', color:'var(--text)', fontSize:'0.95rem', fontFamily:'inherit' }
const iconBtnStyle = { background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', display:'flex', alignItems:'center' }
