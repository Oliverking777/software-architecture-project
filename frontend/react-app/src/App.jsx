import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import PatientsPage from './pages/PatientsPage'
import AlertsPage from './pages/AlertsPage'
import AnalyticsPage from './pages/AnalyticsPage'
import DiseasesPage from './pages/DiseasesPage'
import LocationsPage from './pages/LocationsPage'
import NotificationsPage from './pages/NotificationsPage'
import ProfilePage from './pages/ProfilePage'
import ReportsPage from './pages/ReportsPage'

const ProtectedRoute = ({ children }) => {
  const token = sessionStorage.getItem('dsas_token')
  return token ? children : <Navigate to="/login" replace />
}

function App() {
  const [user, setUser] = useState(() => {
    try {
      const u = sessionStorage.getItem('dsas_user')
      return u ? JSON.parse(u) : null
    } catch { return null }
  })

  const handleLogin = (token, userData) => {
    sessionStorage.setItem('dsas_token', token)
    sessionStorage.setItem('dsas_user', JSON.stringify(userData))
    setUser(userData)
  }

  const handleLogout = () => {
    sessionStorage.clear()
    setUser(null)
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={
          user ? <Navigate to="/dashboard" replace /> : <LoginPage onLogin={handleLogin} />
        } />
        <Route path="/" element={
          <ProtectedRoute>
            <Layout user={user} onLogout={handleLogout} />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="patients" element={<PatientsPage user={user} />} />
          <Route path="alerts" element={<AlertsPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="diseases" element={<DiseasesPage />} />
          <Route path="locations" element={<LocationsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="profile" element={<ProfilePage user={user} onLogout={handleLogout} />} />
          <Route path="reports" element={<ReportsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
