import { useEffect, useRef, useState, useCallback } from 'react'
import { loadFaceApiModels, extractDominantEmotion } from '../../utils/faceApiLoader'
import { getEmotion } from '../../utils/emotions'
import { Camera, CameraOff, Loader, AlertCircle } from 'lucide-react'

const DETECTION_INTERVAL_MS = 1500

/**
 * FaceDetector — Webcam-based real-time face emotion detection.
 *
 * Props:
 *   onEmotionDetected(result)  — called with { emotion, score } each interval
 *   onToggle(isActive)         — called when cam is turned on/off
 */
export default function FaceDetector({ onEmotionDetected, onToggle }) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const intervalRef = useRef(null)

  const [isActive, setIsActive] = useState(false)
  const [status, setStatus] = useState('idle') // idle | loading-models | loading-camera | ready | error
  const [errorMsg, setErrorMsg] = useState('')
  const [faceResult, setFaceResult] = useState(null) // { emotion, score, rawLabel }
  const [noFaceCount, setNoFaceCount] = useState(0)

  // ── Detection loop ─────────────────────────────────────────────────────────
  const runDetection = useCallback(async () => {
    const video = videoRef.current
    if (!video || !window.faceapi || video.readyState < 2) return

    try {
      const detection = await window.faceapi
        .detectSingleFace(video, new window.faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.4 }))
        .withFaceExpressions()

      if (detection) {
        const result = extractDominantEmotion(detection)
        setFaceResult(result)
        setNoFaceCount(0)
        onEmotionDetected?.(result)
      } else {
        setNoFaceCount(prev => prev + 1)
        if (noFaceCount > 3) setFaceResult(null) // clear after 3 misses
      }
    } catch {
      // Silently ignore single detection errors
    }
  }, [onEmotionDetected, noFaceCount])

  // ── Start camera ───────────────────────────────────────────────────────────
  const startCamera = async () => {
    setStatus('loading-models')
    setErrorMsg('')

    try {
      await loadFaceApiModels()
    } catch (err) {
      setStatus('error')
      setErrorMsg('Could not load face models. Check your internet connection.')
      return
    }

    setStatus('loading-camera')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: 'user' },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setStatus('ready')
      setIsActive(true)
      onToggle?.(true)
    } catch (err) {
      setStatus('error')
      setErrorMsg(err.name === 'NotAllowedError'
        ? 'Camera access denied. Please allow camera in browser settings.'
        : 'Camera not available on this device.')
    }
  }

  // ── Stop camera ────────────────────────────────────────────────────────────
  const stopCamera = () => {
    clearInterval(intervalRef.current)
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setIsActive(false)
    setStatus('idle')
    setFaceResult(null)
    onEmotionDetected?.(null)
    onToggle?.(false)
  }

  // ── Detection interval ─────────────────────────────────────────────────────
  useEffect(() => {
    if (status === 'ready') {
      intervalRef.current = setInterval(runDetection, DETECTION_INTERVAL_MS)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [status, runDetection])

  // ── Cleanup on unmount ─────────────────────────────────────────────────────
  useEffect(() => () => stopCamera(), [])

  const emotionMeta = faceResult ? getEmotion(faceResult.emotion) : null

  return (
    <div style={panelStyle}>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div style={headerStyle}>
        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
          <Camera size={15} color="var(--primary)" />
          <span style={{ fontSize:'0.78rem', fontWeight:700, color:'var(--text)', textTransform:'uppercase', letterSpacing:'0.06em' }}>
            Face Emotion
          </span>
        </div>
        <button
          id={isActive ? 'stop-camera-btn' : 'start-camera-btn'}
          onClick={isActive ? stopCamera : startCamera}
          disabled={status === 'loading-models' || status === 'loading-camera'}
          style={camToggleBtnStyle(isActive)}
          title={isActive ? 'Turn off camera' : 'Turn on camera'}
        >
          {status === 'loading-models' || status === 'loading-camera'
            ? <Loader size={14} style={{ animation: 'spin 0.8s linear infinite' }} />
            : isActive ? <CameraOff size={14} /> : <Camera size={14} />
          }
          <span style={{ fontSize:'0.75rem' }}>
            {status === 'loading-models' ? 'Loading AI…'
              : status === 'loading-camera' ? 'Camera…'
              : isActive ? 'Off' : 'On'}
          </span>
        </button>
      </div>

      {/* ── Camera preview ──────────────────────────────────────────────── */}
      <div style={videoWrapStyle}>
        <video
          ref={videoRef}
          muted
          playsInline
          style={{
            ...videoStyle,
            display: isActive && status === 'ready' ? 'block' : 'none',
          }}
        />

        {/* Placeholder when camera is off */}
        {!isActive && status !== 'error' && (
          <div style={placeholderStyle}>
            <Camera size={28} color="var(--text-muted)" />
            <span style={{ fontSize:'0.75rem', color:'var(--text-muted)', textAlign:'center', lineHeight:1.4 }}>
              Enable camera for<br/>face emotion detection
            </span>
          </div>
        )}

        {/* Loading overlay */}
        {(status === 'loading-models' || status === 'loading-camera') && (
          <div style={overlayStyle}>
            <Loader size={22} color="var(--primary)" style={{ animation:'spin 0.8s linear infinite' }} />
            <span style={{ fontSize:'0.8rem', color:'var(--text)' }}>
              {status === 'loading-models' ? 'Loading AI models…' : 'Starting camera…'}
            </span>
          </div>
        )}

        {/* Emotion overlay on video */}
        {isActive && faceResult && (
          <div style={emotionOverlayStyle}>
            <span style={{ fontSize:'1.2rem' }}>{emotionMeta?.emoji}</span>
            <span style={{ fontSize:'0.7rem', fontWeight:700, color: emotionMeta?.color }}>
              {emotionMeta?.label}
            </span>
            <span style={{ fontSize:'0.65rem', color:'var(--text-muted)' }}>
              {Math.round(faceResult.score * 100)}%
            </span>
          </div>
        )}

        {/* No face detected */}
        {isActive && status === 'ready' && !faceResult && (
          <div style={emotionOverlayStyle}>
            <span style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>No face detected</span>
          </div>
        )}
      </div>

      {/* ── Error message ────────────────────────────────────────────────── */}
      {status === 'error' && (
        <div style={errorStyle}>
          <AlertCircle size={13} color="#ef4444" />
          <span style={{ fontSize:'0.75rem', color:'#ef4444', lineHeight:1.4 }}>{errorMsg}</span>
        </div>
      )}

      {/* ── Info badges ──────────────────────────────────────────────────── */}
      {isActive && status === 'ready' && (
        <div style={{ padding:'0.5rem', borderTop:'1px solid var(--glass-border)' }}>
          <p style={{ fontSize:'0.7rem', color:'var(--text-muted)', textAlign:'center', margin:0 }}>
            🔒 All processing is local • No data sent to server
          </p>
        </div>
      )}
    </div>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────
const panelStyle = {
  background: 'var(--surface)',
  border: '1px solid var(--glass-border)',
  borderRadius: 'var(--radius-lg)',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
}
const headerStyle = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  padding: '0.65rem 0.85rem',
  borderBottom: '1px solid var(--glass-border)',
  background: 'var(--surface-alt)',
}
const camToggleBtnStyle = (active) => ({
  display: 'flex', alignItems: 'center', gap: '0.3rem',
  padding: '0.3rem 0.7rem', borderRadius: 'var(--radius-full)',
  border: 'none', cursor: 'pointer', fontFamily: 'inherit',
  background: active ? 'rgba(239,68,68,0.12)' : 'rgba(99,102,241,0.12)',
  color: active ? '#ef4444' : 'var(--primary)',
  fontWeight: 600, transition: 'var(--transition-base)',
})
const videoWrapStyle = {
  position: 'relative', width: '100%', aspectRatio: '4/3',
  background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center',
  minHeight: 120,
}
const videoStyle = {
  width: '100%', height: '100%', objectFit: 'cover',
  transform: 'scaleX(-1)', // mirror effect
}
const placeholderStyle = {
  display: 'flex', flexDirection: 'column', alignItems: 'center',
  gap: '0.5rem', padding: '1rem',
}
const overlayStyle = {
  position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
  alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
  background: 'rgba(0,0,0,0.5)',
}
const emotionOverlayStyle = {
  position: 'absolute', bottom: 6, left: '50%', transform: 'translateX(-50%)',
  display: 'flex', alignItems: 'center', gap: '0.3rem',
  background: 'rgba(0,0,0,0.65)', borderRadius: 'var(--radius-full)',
  padding: '0.25rem 0.65rem', backdropFilter: 'blur(4px)',
}
const errorStyle = {
  display: 'flex', gap: '0.4rem', alignItems: 'flex-start',
  padding: '0.6rem 0.85rem',
  background: 'rgba(239,68,68,0.08)',
}
