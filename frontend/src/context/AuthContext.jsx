import { createContext, useContext, useState, useCallback } from 'react'
import api from '../api/axios'

// ── Context ───────────────────────────────────────────────────
const AuthContext = createContext(null)

// ── Provider ──────────────────────────────────────────────────
export function AuthProvider({ children }) {

  const [token, setToken] = useState(() => localStorage.getItem('dsas_token') || null)
  const [user, setUser]   = useState(() => {
    const stored = localStorage.getItem('dsas_user')
    return stored ? JSON.parse(stored) : null
  })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  // ── Login ────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    setLoading(true)
    setError('')
    try {
      const response = await api.post('/auth-service/login', { email, password })
      const { token, user } = response.data.data

      // Persist to localStorage
      localStorage.setItem('dsas_token', token)
      localStorage.setItem('dsas_user', JSON.stringify(user))

      setToken(token)
      setUser(user)

      return { success: true }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        'Invalid credentials. Please try again.'
      setError(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }, [])

  // ── Register ─────────────────────────────────────────────────
  const register = useCallback(async (fullName, email, password, role) => {
    setLoading(true)
    setError('')
    try {
      const response = await api.post('/auth-service/register', {
        fullName,
        email,
        password,
        role,
      })
      return { success: true, data: response.data.data }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        'Registration failed. Please try again.'
      setError(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }, [])

  // ── Logout ───────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem('dsas_token')
    localStorage.removeItem('dsas_user')
    setToken(null)
    setUser(null)
  }, [])

  // ── Helpers ──────────────────────────────────────────────────
  const isAuthenticated = !!token
  const isAdmin         = user?.role === 'ADMIN'
  const isAnalyst       = user?.role === 'ANALYST'
  const isHealthWorker  = user?.role === 'HEALTH_WORKER'

  return (
    <AuthContext.Provider value={{
      token,
      user,
      loading,
      error,
      login,
      logout,
      register,
      isAuthenticated,
      isAdmin,
      isAnalyst,
      isHealthWorker,
      setError,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

// ── Hook ──────────────────────────────────────────────────────
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}