import { useState } from 'react'
import { Phone, X, AlertTriangle, Heart } from 'lucide-react'

const HELPLINES = [
  { name: 'iCall (India)', number: '9152987821', hours: 'Mon–Sat 8am–10pm' },
  { name: 'Vandrevala Foundation', number: '1860-2662-345', hours: '24/7' },
  { name: 'Snehi', number: '044-24640050', hours: '24/7' },
  { name: 'AASRA', number: '9820466627', hours: '24/7' },
  { name: 'iCall International', number: 'findahelpline.com', hours: 'Global directory', isLink: true },
]

export default function SOSButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Floating SOS button */}
      <button
        id="sos-btn"
        onClick={() => setIsOpen(true)}
        style={sosBtnStyle}
        title="Emergency Support"
        aria-label="SOS Emergency Support"
      >
        <span style={{ fontSize: '1rem', fontWeight: 800 }}>SOS</span>
        <Heart size={14} fill="white" color="white" />
      </button>

      {/* Modal overlay */}
      {isOpen && (
        <div style={overlayStyle} onClick={() => setIsOpen(false)}>
          <div
            style={modalStyle}
            onClick={e => e.stopPropagation()}
            className="animate-slide-up"
          >
            {/* Header */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1rem' }}>
              <div style={{ display:'flex', gap:'0.75rem', alignItems:'center' }}>
                <div style={warningIconStyle}>
                  <AlertTriangle size={22} color="#ef4444" />
                </div>
                <div>
                  <h2 style={{ fontSize:'1.15rem', color:'var(--text)', marginBottom:'0.2rem' }}>
                    You Are Not Alone 💙
                  </h2>
                  <p style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>
                    Immediate support is available right now
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                style={{ ...closeIconStyle }}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize:'0.9rem', color:'var(--text-secondary)', marginBottom:'1.25rem', lineHeight:1.6 }}>
              If you're having thoughts of hurting yourself, please reach out to a crisis helpline immediately.
              These are free, confidential, and available 24/7.
            </p>

            {/* Helplines */}
            <div style={{ display:'flex', flexDirection:'column', gap:'0.6rem' }}>
              {HELPLINES.map((h, i) => (
                <div key={i} style={helplineCardStyle}>
                  <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
                    <Phone size={15} color="#6366f1" />
                    <span style={{ fontWeight:600, fontSize:'0.9rem', color:'var(--text)' }}>{h.name}</span>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'0.25rem', paddingLeft:'1.5rem' }}>
                    {h.isLink ? (
                      <a href={`https://${h.number}`} target="_blank" rel="noopener noreferrer"
                        style={{ color:'var(--primary)', fontWeight:600, fontSize:'0.9rem' }}>
                        {h.number}
                      </a>
                    ) : (
                      <a href={`tel:${h.number}`} style={{ color:'var(--primary)', fontWeight:700, fontSize:'0.95rem', letterSpacing:'0.02em' }}>
                        {h.number}
                      </a>
                    )}
                    <span style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{h.hours}</span>
                  </div>
                </div>
              ))}
            </div>

            <p style={{ textAlign:'center', marginTop:'1.25rem', fontSize:'0.8rem', color:'var(--text-muted)' }}>
              You matter. This moment will pass. Please reach out. 💜
            </p>
          </div>
        </div>
      )}
    </>
  )
}

const sosBtnStyle = {
  position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 200,
  display: 'flex', alignItems: 'center', gap: '0.35rem',
  padding: '0.65rem 1.1rem',
  background: 'linear-gradient(135deg,#ef4444,#dc2626)',
  color: 'white', border: 'none', borderRadius: 'var(--radius-full)',
  boxShadow: '0 4px 20px rgba(239,68,68,0.5)',
  cursor: 'pointer', transition: 'var(--transition-base)',
  animation: 'glow-pulse 2.5s ease infinite',
  fontSize: '0.85rem',
}
const overlayStyle = {
  position: 'fixed', inset: 0, zIndex: 500,
  background: 'rgba(0,0,0,0.6)',
  backdropFilter: 'blur(6px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: '1rem',
}
const modalStyle = {
  background: 'var(--surface)', borderRadius: 'var(--radius-xl)',
  boxShadow: 'var(--shadow-lg)', padding: '1.75rem',
  maxWidth: '480px', width: '100%',
  border: '1px solid var(--glass-border)',
}
const warningIconStyle = {
  width: 44, height: 44, borderRadius: 12,
  background: 'rgba(239,68,68,0.1)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  flexShrink: 0,
}
const closeIconStyle = {
  width: 32, height: 32, borderRadius: '50%', border: 'none',
  background: 'var(--surface-alt)', color: 'var(--text-muted)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', flexShrink: 0,
}
const helplineCardStyle = {
  background: 'var(--surface-alt)', borderRadius: 'var(--radius-md)',
  padding: '0.75rem 1rem',
  border: '1px solid var(--glass-border)',
}
