export default function LoadingSpinner({ fullScreen = false, size = 40, message = 'Loading...' }) {
  const spinnerEl = (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'1rem' }}>
      <div style={{
        width: size, height: size,
        border: `3px solid var(--surface-alt)`,
        borderTop: `3px solid var(--primary)`,
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }} />
      {message && <p style={{ color:'var(--text-muted)', fontSize:'0.875rem' }}>{message}</p>}
    </div>
  )

  if (fullScreen) {
    return (
      <div style={{
        position:'fixed', inset:0, display:'flex',
        alignItems:'center', justifyContent:'center',
        background:'var(--bg)', zIndex:999,
      }}>
        {spinnerEl}
      </div>
    )
  }
  return spinnerEl
}
