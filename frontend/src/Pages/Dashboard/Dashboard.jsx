import { useState } from 'react'
import LeftSidebar from './components/Leftsidebar'
import NavBar from './components/NavBar'
import DashboardContent from './Content/dash'

export default function Dashboard() {
  const [activeNav, setActiveNav] = useState('Dashboard')

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#f9fafb',
      fontFamily: 'system-ui, sans-serif',
    }}>

      {/* ── Left Sidebar (fixed, 260px wide) ── */}
      <LeftSidebar activeItem={activeNav} onItemClick={setActiveNav} />

      {/* ── Right side: navbar + scrollable content ── */}
      <div style={{
        marginLeft: 260,          /* offset for fixed sidebar */
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        minWidth: 0,
      }}>

        {/* Top NavBar */}
        <NavBar />

        {/* Main content — scrollable, sits below the navbar */}
        <main style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 28px 40px',
          background: '#f9fafb',
        }}>
          <DashboardContent />
        </main>

      </div>
    </div>
  )
}