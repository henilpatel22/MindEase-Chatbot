import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import {
  Brain, MessageCircle, BarChart2, Settings, LogOut,
  Sun, Moon, Shield, Menu, X,
} from 'lucide-react'
import { useState } from 'react'
export default function Navbar() {
  const { user, logout } = useAuth()
  const { darkMode, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const navLinks = [
    { to: '/chat',      icon: <MessageCircle size={18} />, label: 'Chat' },
    { to: '/dashboard', icon: <BarChart2 size={18} />,     label: 'Dashboard' },
    ...(user?.role === 'admin' ? [{ to: '/admin', icon: <Shield size={18} />, label: 'Admin' }] : []),
  ]

  return (
    <nav style={navStyle}>
      <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
        <div style={logoIconStyle}>
          <Brain size={20} color="white" />
        </div>
        <span style={logoTextStyle}>MindEase</span>
      </div>

      {/* Desktop nav links */}
      <div style={{ display:'flex', alignItems:'center', gap:'0.25rem' }} className="hide-mobile">
        {navLinks.map(link => (
          <Link
            key={link.to}
            to={link.to}
            style={{
              ...navLinkStyle,
              ...(location.pathname === link.to ? navLinkActiveStyle : {}),
            }}
          >
            {link.icon}
            {link.label}
          </Link>
        ))}
      </div>

      {/* Right actions */}
      <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
        {/* Theme toggle */}
        <button
          id="theme-toggle-btn"
          onClick={toggleTheme}
          style={iconBtnStyle}
          title={darkMode ? 'Light mode' : 'Dark mode'}
          aria-label="Toggle theme"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* User info + logout (desktop) */}
        {user && (
          <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }} className="hide-mobile">
            <div style={avatarStyle}>{user.username?.[0]?.toUpperCase()}</div>
            <span style={{ fontSize:'0.875rem', color:'var(--text-secondary)', fontWeight:500 }}>
              {user.username}
            </span>
            <button
              id="logout-btn"
              onClick={handleLogout}
              style={{ ...iconBtnStyle, color:'#ef4444' }}
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        )}

        {/* Mobile menu toggle */}
        <button
          style={iconBtnStyle}
          onClick={() => setMenuOpen(!menuOpen)}
          className="show-mobile"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div style={mobileMenuStyle}>
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              style={mobileNavLinkStyle}
              onClick={() => setMenuOpen(false)}
            >
              {link.icon} {link.label}
            </Link>
          ))}
          {user && (
            <button
              onClick={() => { handleLogout(); setMenuOpen(false) }}
              style={{ ...mobileNavLinkStyle, border:'none', background:'none', cursor:'pointer', color:'#ef4444' }}
            >
              <LogOut size={18} /> Logout
            </button>
          )}
        </div>
      )}
    </nav>
  )
}

// ── Inline styles ─────────────────────────────────────────────────────────────
const navStyle = {
  position: 'sticky', top: 0, zIndex: 100,
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '0 1.5rem', height: '64px',
  background: 'var(--glass)', backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  borderBottom: '1px solid var(--glass-border)',
  boxShadow: 'var(--shadow-sm)',
  flexWrap: 'wrap', gap: '0.5rem',
}
const logoIconStyle = {
  width: 36, height: 36, borderRadius: 10,
  background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}
const logoTextStyle = {
  fontSize: '1.2rem', fontWeight: 800,
  background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
}
const navLinkStyle = {
  display: 'flex', alignItems: 'center', gap: '0.4rem',
  padding: '0.45rem 0.85rem', borderRadius: 'var(--radius-full)',
  fontSize: '0.875rem', fontWeight: 500,
  color: 'var(--text-secondary)', transition: 'var(--transition-base)',
  textDecoration: 'none',
}
const navLinkActiveStyle = {
  background: 'rgba(99,102,241,0.12)',
  color: 'var(--primary)',
}
const iconBtnStyle = {
  width: 36, height: 36, borderRadius: '50%', border: 'none',
  background: 'var(--surface-alt)', color: 'var(--text-secondary)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  transition: 'var(--transition-base)', cursor: 'pointer',
}
const avatarStyle = {
  width: 32, height: 32, borderRadius: '50%',
  background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
  color: 'white', fontWeight: 700, fontSize: '0.85rem',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}
const mobileMenuStyle = {
  position: 'absolute', top: '64px', left: 0, right: 0,
  background: 'var(--surface)', boxShadow: 'var(--shadow-lg)',
  borderBottom: '1px solid var(--glass-border)',
  display: 'flex', flexDirection: 'column', padding: '0.5rem',
  gap: '0.25rem', zIndex: 99,
}
const mobileNavLinkStyle = {
  display: 'flex', alignItems: 'center', gap: '0.5rem',
  padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
  fontSize: '0.9rem', fontWeight: 500, color: 'var(--text)',
  textDecoration: 'none',
}
