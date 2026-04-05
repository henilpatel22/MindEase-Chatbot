import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { CHART_COLORS, EMOTIONS } from '../../utils/emotions'

/**
 * Donut pie chart showing emotion distribution counts.
 * @param {Object} emotionCounts - { happy: 5, sad: 3, ... }
 */
export default function EmotionStats({ emotionCounts = {} }) {
  const data = Object.entries(emotionCounts)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({
      name,
      value,
      emoji: EMOTIONS[name]?.emoji ?? '❓',
    }))

  if (data.length === 0) {
    return (
      <div style={emptyStyle}>
        <span style={{ fontSize: '2.5rem' }}>🥧</span>
        <p>No emotion data yet</p>
      </div>
    )
  }

  const total = data.reduce((s, d) => s + d.value, 0)

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={data}
          cx="50%" cy="50%"
          innerRadius={55} outerRadius={85}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((entry) => (
            <Cell key={entry.name} fill={CHART_COLORS[entry.name] || '#6b7280'} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: 'var(--surface)', border: '1px solid var(--glass-border)',
            borderRadius: 10, fontSize: 12,
          }}
          formatter={(val, name, props) => [
            `${val} (${Math.round((val / total) * 100)}%)`,
            `${props.payload.emoji} ${name}`,
          ]}
        />
        <Legend
          formatter={(val, entry) => (
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              {entry.payload.emoji} {val}
            </span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

const emptyStyle = {
  display: 'flex', flexDirection: 'column', alignItems: 'center',
  gap: '0.75rem', padding: '2.5rem 1rem',
  color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center',
}
