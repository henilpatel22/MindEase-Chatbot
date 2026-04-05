import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Brain, User, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Register() {
  const [form, setForm] = useState({ username:'', email:'', password:'' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.username || !form.email || !form.password) { toast.error('Please fill in all fields'); return }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      await register(form.username, form.email, form.password)
      toast.success('Account created! Welcome to MindEase 💚')
      navigate('/chat')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const strength = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 10 ? 2 : 3
  const strengthColors = ['transparent', '#ef4444', '#f59e0b', '#10b981']
  const strengthLabels = ['', 'Weak', 'Good', 'Strong']

  return (
    <div style={pageStyle}>
      <div style={blob1} /><div style={blob2} />

      <div style={cardStyle} className="animate-slide-up">
        <div style={{ textAlign:'center', marginBottom:'2rem' }}>
          <div style={logoStyle}><Brain size={24} color="white" /></div>
          <h1 style={{ fontSize:'1.5rem', marginTop:'1rem', marginBottom:'0.4rem' }}>Create your account</h1>
          <p style={{ color:'var(--text-muted)', fontSize:'0.875rem' }}>Start your mental wellness journey today</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          {/* Username */}
          <div className="form-group">
            <label htmlFor="username-input" className="form-label">Username</label>
            <div style={inputWrapStyle}>
              <User size={16} color="var(--text-muted)" style={{ flexShrink:0 }} />
              <input
                id="username-input"
                type="text"
                placeholder="your_name"
                value={form.username}
                onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                style={inputInnerStyle}
              />
            </div>
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="reg-email-input" className="form-label">Email</label>
            <div style={inputWrapStyle}>
              <Mail size={16} color="var(--text-muted)" style={{ flexShrink:0 }} />
              <input
                id="reg-email-input"
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
            <label htmlFor="reg-password-input" className="form-label">Password</label>
            <div style={inputWrapStyle}>
              <Lock size={16} color="var(--text-muted)" style={{ flexShrink:0 }} />
              <input
                id="reg-password-input"
                type={showPw ? 'text' : 'password'}
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                style={inputInnerStyle}
              />
              <button type="button" onClick={() => setShowPw(!showPw)} style={iconBtnStyle} aria-label="Toggle password">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {/* Password strength bar */}
            {form.password && (
              <div style={{ marginTop:'0.4rem' }}>
                <div style={{ display:'flex', gap:'4px', marginBottom:'0.2rem' }}>
                  {[1,2,3].map(i => (
                    <div key={i} style={{ flex:1, height:4, borderRadius:2, background: i <= strength ? strengthColors[strength] : 'var(--glass-border)', transition:'background 0.3s' }} />
                  ))}
                </div>
                <span style={{ fontSize:'0.75rem', color: strengthColors[strength] }}>{strengthLabels[strength]}</span>
              </div>
            )}
          </div>

          <button
            id="register-submit-btn"
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ marginTop:'0.5rem', padding:'0.75rem', fontSize:'0.95rem' }}
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign:'center', marginTop:'1.5rem', fontSize:'0.875rem', color:'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color:'var(--primary)', fontWeight:600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}

const pageStyle = { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'1.5rem', position:'relative', overflow:'hidden' }
const blob1 = { position:'fixed', top:'-120px', right:'-120px', width:'500px', height:'500px', borderRadius:'50%', background:'radial-gradient(circle, rgba(139,92,246,0.2), transparent 70%)', filter:'blur(80px)', pointerEvents:'none' }
const blob2 = { position:'fixed', bottom:'-80px', left:'-80px', width:'400px', height:'400px', borderRadius:'50%', background:'radial-gradient(circle, rgba(99,102,241,0.15), transparent 70%)', filter:'blur(80px)', pointerEvents:'none' }
const cardStyle = { background:'var(--surface)', borderRadius:'var(--radius-xl)', boxShadow:'var(--shadow-lg)', padding:'2.5rem', width:'100%', maxWidth:'420px', position:'relative', zIndex:1, border:'1px solid var(--glass-border)' }
const logoStyle = { width:56, height:56, borderRadius:16, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto', boxShadow:'0 8px 24px rgba(99,102,241,0.4)' }
const inputWrapStyle = { display:'flex', alignItems:'center', gap:'0.6rem', background:'var(--surface-alt)', border:'2px solid var(--glass-border)', borderRadius:'var(--radius-md)', padding:'0.65rem 0.9rem' }
const inputInnerStyle = { flex:1, border:'none', outline:'none', background:'transparent', color:'var(--text)', fontSize:'0.95rem', fontFamily:'inherit' }
const iconBtnStyle = { background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', display:'flex', alignItems:'center' }
