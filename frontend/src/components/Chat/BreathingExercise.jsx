import { useState, useEffect, useRef } from 'react'
import { Wind, X } from 'lucide-react'

const PHASES = [
  { label: 'Inhale',  duration: 4000, scale: 1.4, color: '#6366f1' },
  { label: 'Hold',    duration: 4000, scale: 1.4, color: '#8b5cf6' },
  { label: 'Exhale',  duration: 4000, scale: 0.7, color: '#10b981' },
  { label: 'Hold',    duration: 4000, scale: 0.7, color: '#3b82f6' },
]
const TOTAL_CYCLES = 4

/**
 * BreathingExercise — Box breathing 4-4-4-4 with animated expanding circle.
 * Props:
 *   onClose() — called when user closes or finishes all cycles
 *   autoStart — if true, starts immediately
 */
export default function BreathingExercise({ onClose, autoStart = false }) {
  const [started, setStarted] = useState(autoStart)
  const [phaseIdx, setPhaseIdx] = useState(0)
  const [cycle, setCycle] = useState(1)
  const [elapsed, setElapsed] = useState(0) // ms since phase start
  const timerRef = useRef(null)

  const phase = PHASES[phaseIdx]
  const progress = Math.min(elapsed / phase.duration, 1)

  useEffect(() => {
    if (!started) return
    timerRef.current = setInterval(() => {
      setElapsed(prev => {
        const next = prev + 50
        if (next >= phase.duration) {
          // Advance phase
          const nextPhase = (phaseIdx + 1) % PHASES.length
          setPhaseIdx(nextPhase)
          setElapsed(0)
          if (nextPhase === 0) {
            if (cycle >= TOTAL_CYCLES) {
              clearInterval(timerRef.current)
              setTimeout(() => onClose?.(), 1200)
            } else {
              setCycle(c => c + 1)
            }
          }
          return 0
        }
        return next
      })
    }, 50)
    return () => clearInterval(timerRef.current)
  }, [started, phaseIdx, cycle, phase.duration, onClose])

  const secondsLeft = Math.ceil((phase.duration - elapsed) / 1000)

  return (
    <div style={overlayStyle} onClick={(e) => e.target === e.currentTarget && onClose?.()}>
      <div style={modalStyle} className="animate-slide-up">
        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.75rem' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
            <Wind size={18} color="var(--primary)" />
            <h2 style={{ fontSize:'1.05rem', margin:0 }}>Box Breathing Exercise</h2>
          </div>
          <button onClick={onClose} style={closeBtnStyle} aria-label="Close"><X size={16} /></button>
        </div>

        <p style={{ fontSize:'0.82rem', color:'var(--text-muted)', marginBottom:'1.5rem', textAlign:'center' }}>
          Follow the circle • {TOTAL_CYCLES} cycles • Breathe naturally
        </p>

        {/* Animated circle */}
        <div style={circleContainerStyle}>
          {/* Background ring */}
          <div style={{ ...ringStyle, opacity:0.15 }} />

          {/* Animated breathing circle */}
          <div style={{
            ...breathingCircleStyle,
            transform: `scale(${started ? phase.scale : 1})`,
            background: `radial-gradient(circle, ${phase.color}55 0%, ${phase.color}22 100%)`,
            border: `3px solid ${phase.color}`,
            transition: `transform ${phase.duration / 1000}s ease-in-out, background ${phase.duration / 1000}s ease`,
          }}>
            {started ? (
              <>
                <span style={{ fontSize:'2.2rem', fontWeight:800, color: phase.color }}>{secondsLeft}</span>
                <span style={{ fontSize:'0.85rem', fontWeight:700, color: phase.color, letterSpacing:'0.05em' }}>
                  {phase.label.toUpperCase()}
                </span>
              </>
            ) : (
              <Wind size={32} color="var(--primary)" />
            )}
          </div>

          {/* Progress ring segments (visual guide) */}
          <svg style={svgStyle} viewBox="0 0 120 120">
            {/* Background track */}
            <circle cx="60" cy="60" r="54" fill="none" stroke="var(--glass-border)" strokeWidth="4" />
            {/* Progress arc */}
            {started && (
              <circle
                cx="60" cy="60" r="54"
                fill="none"
                stroke={phase.color}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${progress * 339.3} 339.3`}
                style={{ transform:'rotate(-90deg)', transformOrigin:'center', transition:'stroke-dasharray 0.1s linear' }}
              />
            )}
          </svg>
        </div>

        {/* Phase guide */}
        <div style={phaseGuideStyle}>
          {PHASES.map((p, i) => (
            <div key={i} style={{ ...phaseStepStyle, opacity: i === phaseIdx && started ? 1 : 0.4 }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background: i === phaseIdx && started ? p.color : 'var(--text-muted)' }} />
              <span style={{ fontSize:'0.75rem', color: i === phaseIdx && started ? p.color : 'var(--text-muted)', fontWeight: i === phaseIdx && started ? 700 : 400 }}>
                {p.label} {p.duration / 1000}s
              </span>
            </div>
          ))}
        </div>

        {/* Cycle counter */}
        {started && (
          <p style={{ textAlign:'center', fontSize:'0.8rem', color:'var(--text-muted)', margin:'0.75rem 0 0' }}>
            Cycle <strong style={{ color:'var(--text)' }}>{cycle}</strong> of {TOTAL_CYCLES}
          </p>
        )}

        {/* Start / Stop */}
        {!started ? (
          <button
            id="start-breathing-btn"
            onClick={() => setStarted(true)}
            className="btn btn-primary"
            style={{ width:'100%', marginTop:'1.25rem', padding:'0.75rem' }}
          >
            <Wind size={16} /> Start Breathing Exercise
          </button>
        ) : (
          <button
            onClick={onClose}
            className="btn btn-ghost"
            style={{ width:'100%', marginTop:'1rem', fontSize:'0.85rem' }}
          >
            End Exercise
          </button>
        )}
      </div>
    </div>
  )
}

const overlayStyle = {
  position: 'fixed', inset: 0, zIndex: 600,
  background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
}
const modalStyle = {
  background: 'var(--surface)', borderRadius: 'var(--radius-xl)',
  boxShadow: 'var(--shadow-lg)', padding: '1.75rem',
  maxWidth: '360px', width: '100%', border: '1px solid var(--glass-border)',
}
const closeBtnStyle = {
  width:30, height:30, borderRadius:'50%', border:'none',
  background:'var(--surface-alt)', color:'var(--text-muted)',
  display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer',
}
const circleContainerStyle = {
  position:'relative', width:180, height:180, margin:'0 auto 1rem',
  display:'flex', alignItems:'center', justifyContent:'center',
}
const ringStyle = {
  position:'absolute', inset:0, borderRadius:'50%',
  border:'3px solid var(--primary)',
}
const breathingCircleStyle = {
  width:110, height:110, borderRadius:'50%',
  display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
  position:'relative', zIndex:1,
}
const svgStyle = {
  position:'absolute', inset:0, width:'100%', height:'100%',
}
const phaseGuideStyle = {
  display:'flex', justifyContent:'center', gap:'1.25rem', flexWrap:'wrap',
}
const phaseStepStyle = {
  display:'flex', alignItems:'center', gap:'0.35rem', transition:'opacity 0.3s',
}
