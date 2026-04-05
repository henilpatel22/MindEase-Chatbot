import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'
import { CHART_COLORS } from '../../utils/emotions'

/**
 * Mood trend line chart — shows daily emotion counts over time.
 * @param {Array} data - Array of { date, happy, sad, angry, anxious, neutral }
 */
export default function MoodChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div style={emptyStyle}>
        <span style={{ fontSize: '2.5rem' }}>📊</span>
        <p>No mood data yet. Start chatting to build your trend!</p>
      </div>
    )
  }

  // Format date labels to 'MMM D'
  const formatted = data.map(d => ({
    ...d,
    date: new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', { month:'short', day:'numeric' }),
  }))

  const emotions = ['happy', 'sad', 'angry', 'anxious', 'neutral']
  const emojis   = { happy:'😊', sad:'😔', angry:'😠', anxious:'😰', neutral:'😐' }

  return (
    <div style={{ width:'100%' }}>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={formatted} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" />
          <XAxis
            dataKey="date"
            tick={{ fill:'var(--text-muted)', fontSize:11 }}
            axisLine={false} tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill:'var(--text-muted)', fontSize:11 }}
            axisLine={false} tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background:'var(--surface)', border:'1px solid var(--glass-border)',
              borderRadius:10, fontSize:12, boxShadow:'var(--shadow-md)',
            }}
            formatter={(val, name) => [`${val} times`, `${emojis[name]} ${name}`]}
          />
          <Legend
            formatter={(val) => (
              <span style={{ fontSize:12, color:'var(--text-secondary)' }}>
                {emojis[val]} {val}
              </span>
            )}
          />
          {emotions.map(em => (
            <Line
              key={em}
              type="monotone"
              dataKey={em}
              stroke={CHART_COLORS[em]}
              strokeWidth={2.5}
              dot={{ r: 4, fill: CHART_COLORS[em], strokeWidth: 0 }}
              activeDot={{ r: 6 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

const emptyStyle = {
  display: 'flex', flexDirection: 'column', alignItems: 'center',
  gap: '0.75rem', padding: '2.5rem 1rem',
  color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center',
}
