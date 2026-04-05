import { useState, useEffect } from 'react'
import Navbar from '../components/Common/Navbar'
import LoadingSpinner from '../components/Common/LoadingSpinner'
import axiosInstance from '../api/axiosConfig'
import { Users, Activity, AlertTriangle, MessageCircle, Trash2, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { EMOTIONS } from '../utils/emotions'

export default function AdminPage() {
  const [tab, setTab] = useState('overview')
  const [activity, setActivity] = useState(null)
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [tab])

  const fetchData = async () => {
    setLoading(true)
    try {
      if (tab === 'overview') {
        const res = await axiosInstance.get('/admin/activity')
        setActivity(res.data)
      } else {
        const res = await axiosInstance.get('/admin/users')
        setUsers(res.data.users || [])
      }
    } catch { toast.error('Failed to load admin data') }
    finally { setLoading(false) }
  }

  const deleteUser = async (id, username) => {
    if (!window.confirm(`Delete user "${username}" and all their data? This is irreversible.`)) return
    try {
      await axiosInstance.delete(`/admin/users/${id}`)
      toast.success(`User "${username}" deleted`)
      setUsers(prev => prev.filter(u => u._id !== id))
    } catch { toast.error('Failed to delete user') }
  }

  const filteredUsers = users.filter(u =>
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:'100vh' }}>
      <Navbar />

      <main style={{ flex:1, maxWidth:'1100px', margin:'0 auto', width:'100%', padding:'2rem 1.5rem' }}>
        <div style={{ marginBottom:'2rem' }}>
          <h1 style={{ fontSize:'1.6rem', marginBottom:'0.35rem' }}>Admin Panel 🛡️</h1>
          <p style={{ color:'var(--text-muted)', fontSize:'0.9rem' }}>Manage users and monitor platform activity</p>
        </div>

        {/* Tab bar */}
        <div style={{ display:'flex', gap:'0.5rem', borderBottom:'2px solid var(--glass-border)', marginBottom:'2rem' }}>
          {['overview', 'users'].map(t => (
            <button
              key={t}
              id={`admin-tab-${t}`}
              onClick={() => setTab(t)}
              style={{
                padding:'0.6rem 1.25rem', border:'none', cursor:'pointer', background:'transparent',
                fontWeight:600, fontSize:'0.875rem', borderRadius:'var(--radius-md) var(--radius-md) 0 0',
                borderBottom: t === tab ? '2px solid var(--primary)' : '2px solid transparent',
                color: t === tab ? 'var(--primary)' : 'var(--text-muted)',
                transition:'var(--transition-base)', marginBottom:'-2px',
              }}
            >
              {t === 'overview' ? '📊 Overview' : '👥 Users'}
            </button>
          ))}
        </div>

        {loading ? <LoadingSpinner message="Loading…" /> : (
          <>
            {/* ── Overview Tab ──────────────────────────────────── */}
            {tab === 'overview' && activity && (
              <div>
                {/* Stat cards */}
                <div style={statsGrid}>
                  <AdminStatCard icon={<Users size={22} color="#6366f1" />} label="Total Users" value={activity.stats?.totalUsers} color="rgba(99,102,241,0.1)" />
                  <AdminStatCard icon={<MessageCircle size={22} color="#10b981" />} label="Conversations" value={activity.stats?.totalConversations} color="rgba(16,185,129,0.1)" />
                  <AdminStatCard icon={<Activity size={22} color="#8b5cf6" />} label="Mood Logs" value={activity.stats?.totalMoodLogs} color="rgba(139,92,246,0.1)" />
                  <AdminStatCard icon={<AlertTriangle size={22} color="#ef4444" />} label="Crisis Events (7d)" value={activity.stats?.crisisCount} color="rgba(239,68,68,0.1)" />
                </div>

                {/* Recent users */}
                <div className="card" style={{ marginTop:'1.5rem' }}>
                  <h2 style={{ fontSize:'1rem', marginBottom:'1rem' }}>Recent Signups</h2>
                  <table style={tableStyle}>
                    <thead>
                      <tr>
                        {['Username', 'Email', 'Role', 'Joined'].map(h => (
                          <th key={h} style={thStyle}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {activity.recentUsers?.map(u => (
                        <tr key={u._id} style={trStyle}>
                          <td style={tdStyle}><strong>{u.username}</strong></td>
                          <td style={tdStyle}>{u.email}</td>
                          <td style={tdStyle}>
                            <span style={{ ...roleBadge, background: u.role === 'admin' ? 'rgba(239,68,68,0.12)' : 'rgba(16,185,129,0.12)', color: u.role === 'admin' ? '#ef4444' : '#10b981' }}>
                              {u.role}
                            </span>
                          </td>
                          <td style={tdStyle}>{new Date(u.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── Users Tab ─────────────────────────────────────── */}
            {tab === 'users' && (
              <div>
                <div style={{ marginBottom:'1rem', display:'flex', alignItems:'center', gap:'0.6rem', background:'var(--surface-alt)', border:'2px solid var(--glass-border)', borderRadius:'var(--radius-md)', padding:'0.6rem 1rem' }}>
                  <Search size={16} color="var(--text-muted)" />
                  <input
                    id="user-search-input"
                    type="text"
                    placeholder="Search users…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ border:'none', outline:'none', background:'transparent', color:'var(--text)', fontSize:'0.9rem', fontFamily:'inherit', flex:1 }}
                  />
                </div>

                <div className="card" style={{ padding:0, overflow:'hidden' }}>
                  <table style={{ ...tableStyle, borderRadius:'var(--radius-lg)', overflow:'hidden' }}>
                    <thead>
                      <tr style={{ background:'var(--surface-alt)' }}>
                        {['Username', 'Email', 'Role', 'Joined', 'Last Login', 'Actions'].map(h => (
                          <th key={h} style={thStyle}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map(u => (
                        <tr key={u._id} style={trStyle}>
                          <td style={tdStyle}><strong>{u.username}</strong></td>
                          <td style={tdStyle}>{u.email}</td>
                          <td style={tdStyle}>
                            <span style={{ ...roleBadge, background: u.role === 'admin' ? 'rgba(239,68,68,0.12)' : 'rgba(99,102,241,0.12)', color: u.role === 'admin' ? '#ef4444' : '#6366f1' }}>
                              {u.role}
                            </span>
                          </td>
                          <td style={tdStyle}>{new Date(u.createdAt).toLocaleDateString()}</td>
                          <td style={tdStyle}>{u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : '—'}</td>
                          <td style={tdStyle}>
                            <button
                              id={`delete-user-${u._id}`}
                              onClick={() => deleteUser(u._id, u.username)}
                              style={deleteBtnStyle}
                              title="Delete user"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredUsers.length === 0 && (
                        <tr><td colSpan={6} style={{ ...tdStyle, textAlign:'center', color:'var(--text-muted)', padding:'2rem' }}>No users found</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

function AdminStatCard({ icon, label, value, color }) {
  return (
    <div className="card" style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
      <div style={{ width:50, height:50, borderRadius:14, background:color, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{icon}</div>
      <div>
        <p style={{ fontSize:'0.75rem', color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:'0.2rem' }}>{label}</p>
        <p style={{ fontSize:'1.5rem', fontWeight:800 }}>{value ?? '—'}</p>
      </div>
    </div>
  )
}

const statsGrid = { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:'1rem', marginBottom:'1rem' }
const tableStyle = { width:'100%', borderCollapse:'collapse' }
const thStyle = { padding:'0.65rem 1rem', textAlign:'left', fontSize:'0.78rem', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em' }
const tdStyle = { padding:'0.7rem 1rem', fontSize:'0.875rem', borderTop:'1px solid var(--glass-border)', color:'var(--text-secondary)' }
const trStyle = { transition:'var(--transition-fast)' }
const roleBadge = { padding:'0.2rem 0.6rem', borderRadius:'var(--radius-full)', fontSize:'0.75rem', fontWeight:700 }
const deleteBtnStyle = { width:30, height:30, borderRadius:8, border:'none', background:'rgba(239,68,68,0.1)', color:'#ef4444', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }
