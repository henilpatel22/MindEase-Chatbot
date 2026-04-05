import { useState, useEffect } from 'react'
import Navbar from '../components/Common/Navbar'
import SOSButton from '../components/Common/SOSButton'
import MoodChart from '../components/Dashboard/MoodChart'
import EmotionStats from '../components/Dashboard/EmotionStats'
import LoadingSpinner from '../components/Common/LoadingSpinner'
import { moodAPI } from '../api/mood'
import { useAuth } from '../context/AuthContext'
import { EMOTIONS } from '../utils/emotions'
import { BarChart2, TrendingUp, Calendar, Zap } from 'lucide-react'
import toast from 'react-hot-toast'

const PERIOD_OPTIONS = [
  { label: '7 Days', value: 7 },
  { label: '14 Days', value: 14 },
  { label: '30 Days', value: 30 },
]

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState(7)

  useEffect(() => {
    fetchStats()
  }, [period])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const res = await moodAPI.getStats(period)
      setStats(res.data)
    } catch {
      toast.error('Failed to load mood data')
    } finally {
      setLoading(false)
    }
  }

  // Find dominant emotion
  const dominantEmotion = stats?.emotionCounts
    ? Object.entries(stats.emotionCounts).sort((a, b) => b[1] - a[1])[0]?.[0]
    : null
  const dominantMeta = dominantEmotion ? EMOTIONS[dominantEmotion] : null

  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:'100vh' }}>
      <Navbar />

      <main style={{ flex:1, maxWidth:'1100px', margin:'0 auto', width:'100%', padding:'2rem 1.5rem' }}>
        {/* Page heading */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'1rem', marginBottom:'2rem' }}>
          <div>
            <h1 style={{ fontSize:'1.6rem', marginBottom:'0.35rem' }}>
              Mood Dashboard 📊
            </h1>
            <p style={{ color:'var(--text-muted)', fontSize:'0.9rem' }}>
              Your emotional patterns for {user?.username}
            </p>
          </div>

          {/* Period picker */}
          <div style={{ display:'flex', gap:'0.4rem', background:'var(--surface-alt)', padding:'0.3rem', borderRadius:'var(--radius-full)' }}>
            {PERIOD_OPTIONS.map(opt => (
              <button
                key={opt.value}
                id={`period-btn-${opt.value}`}
                onClick={() => setPeriod(opt.value)}
                style={{
                  padding:'0.4rem 0.85rem', borderRadius:'var(--radius-full)',
                  border:'none', cursor:'pointer', fontSize:'0.82rem', fontWeight:600,
                  background: period === opt.value ? 'var(--primary)' : 'transparent',
                  color: period === opt.value ? 'white' : 'var(--text-muted)',
                  transition:'var(--transition-base)',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading your mood data…" />
        ) : (
          <>
            {/* ── Stat cards ─────────────────────────────────────── */}
            <div style={statsGridStyle}>
              <StatCard
                icon={<BarChart2 size={20} color="#6366f1" />}
                label="Total Logs"
                value={stats?.totalLogs ?? 0}
                color="rgba(99,102,241,0.1)"
              />
              <StatCard
                icon={<span style={{ fontSize:'1.4rem' }}>{dominantMeta?.emoji ?? '❓'}</span>}
                label="Dominant Mood"
                value={dominantMeta ? dominantMeta.label : '—'}
                color={dominantMeta ? dominantMeta.bg : 'var(--surface-alt)'}
              />
              <StatCard
                icon={<TrendingUp size={20} color="#10b981" />}
                label="Days Tracked"
                value={stats?.dailyTrend?.length ?? 0}
                color="rgba(16,185,129,0.1)"
              />
              <StatCard
                icon={<Calendar size={20} color="#f59e0b" />}
                label="Period"
                value={`${period} days`}
                color="rgba(245,158,11,0.1)"
              />
            </div>

            {/* ── Charts ─────────────────────────────────────────── */}
            <div style={chartsGridStyle}>
              {/* Trend chart */}
              <div className="card" style={{ gridColumn:'span 2' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem' }}>
                  <h2 style={{ fontSize:'1rem' }}>Daily Mood Trend</h2>
                  <span style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>Entries per emotion per day</span>
                </div>
                <MoodChart data={stats?.dailyTrend ?? []} />
              </div>

              {/* Pie chart */}
              <div className="card">
                <h2 style={{ fontSize:'1rem', marginBottom:'1.25rem' }}>Emotion Distribution</h2>
                <EmotionStats emotionCounts={stats?.emotionCounts ?? {}} />
              </div>

              {/* Emotion breakdown table */}
              <div className="card">
                <h2 style={{ fontSize:'1rem', marginBottom:'1.25rem' }}>Breakdown</h2>
                <div style={{ display:'flex', flexDirection:'column', gap:'0.6rem' }}>
                  {Object.entries(stats?.emotionCounts ?? {})
                    .sort((a, b) => b[1] - a[1])
                    .map(([em, count]) => {
                      const meta = EMOTIONS[em]
                      const total = stats?.totalLogs || 1
                      const pct = Math.round((count / total) * 100)
                      return (
                        <div key={em}>
                          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px', fontSize:'0.85rem' }}>
                            <span style={{ display:'flex', alignItems:'center', gap:'0.4rem' }}>
                              {meta?.emoji} <span style={{ color:'var(--text)', fontWeight:600 }}>{meta?.label ?? em}</span>
                            </span>
                            <span style={{ color:'var(--text-muted)' }}>{count} ({pct}%)</span>
                          </div>
                          <div style={{ height:6, borderRadius:3, background:'var(--surface-alt)' }}>
                            <div style={{ height:'100%', borderRadius:3, width:`${pct}%`, background: meta?.color ?? '#6b7280', transition:'width 0.8s ease' }} />
                          </div>
                        </div>
                      )
                    })}
                  {Object.keys(stats?.emotionCounts ?? {}).length === 0 && (
                    <p style={{ color:'var(--text-muted)', fontSize:'0.875rem', textAlign:'center', padding:'1rem' }}>
                      No data for this period
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Wellness tip */}
            <div style={tipBannerStyle}>
              <Zap size={18} color="#f59e0b" />
              <p style={{ margin:0, fontSize:'0.875rem', color:'var(--text)' }}>
                <strong>Daily Tip:</strong> Tracking your emotions consistently helps you spot patterns and triggers.
                Try journaling alongside chatting for deeper insights!
              </p>
            </div>
          </>
        )}
      </main>

      <SOSButton />
    </div>
  )
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="card" style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
      <div style={{ width:48, height:48, borderRadius:14, background:color, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize:'0.78rem', color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'0.2rem' }}>{label}</p>
        <p style={{ fontSize:'1.3rem', fontWeight:800, color:'var(--text)' }}>{value}</p>
      </div>
    </div>
  )
}

const statsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: '1rem',
  marginBottom: '1.5rem',
}
const chartsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '1.25rem',
  marginBottom: '1.5rem',
}
const tipBannerStyle = {
  display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
  background: 'rgba(245,158,11,0.08)',
  border: '1px solid rgba(245,158,11,0.2)',
  borderRadius: 'var(--radius-md)',
  padding: '1rem 1.25rem',
}
