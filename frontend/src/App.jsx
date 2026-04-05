import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import ChatPage from './pages/ChatPage'
import Dashboard from './pages/Dashboard'
import AdminPage from './pages/Admin'
import LoadingSpinner from './components/Common/LoadingSpinner'

// Route guard: redirect to login if not authenticated
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <LoadingSpinner fullScreen />
  return user ? children : <Navigate to="/login" replace />
}

// Route guard: redirect to chat if already logged in
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <LoadingSpinner fullScreen />
  return !user ? children : <Navigate to="/chat" replace />
}

// Admin-only guard
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <LoadingSpinner fullScreen />
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'admin') return <Navigate to="/chat" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      {/* Protected */}
      <Route path="/chat"      element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
