import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../api/auth'
import axiosInstance from '../api/axiosConfig'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken') || null)
  const [loading, setLoading] = useState(true)

  // Attach token to every axios request
  useEffect(() => {
    if (accessToken) {
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
      localStorage.setItem('accessToken', accessToken)
    } else {
      delete axiosInstance.defaults.headers.common['Authorization']
      localStorage.removeItem('accessToken')
    }
  }, [accessToken])

  // Load user on first mount (if token exists)
  useEffect(() => {
    const initAuth = async () => {
      if (!accessToken) { setLoading(false); return }
      try {
        const res = await authAPI.getMe()
        setUser(res.data.user)
      } catch {
        // Token may be expired — try refresh
        try {
          const refreshRes = await authAPI.refresh()
          const newToken = refreshRes.data.accessToken
          setAccessToken(newToken)
          const meRes = await authAPI.getMe()
          setUser(meRes.data.user)
        } catch {
          setAccessToken(null)
          setUser(null)
        }
      } finally {
        setLoading(false)
      }
    }
    initAuth()
    // eslint-disable-next-line
  }, [])

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password })
    setAccessToken(res.data.accessToken)
    setUser(res.data.user)
    return res.data
  }

  const register = async (username, email, password) => {
    const res = await authAPI.register({ username, email, password })
    setAccessToken(res.data.accessToken)
    setUser(res.data.user)
    return res.data
  }

  const logout = async () => {
    try { await authAPI.logout() } catch { /* ignore */ }
    setAccessToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, accessToken, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
