import { useState } from 'react'

export default function NavBar() {
  const [darkMode, setDarkMode] = useState(false)

  // Live clock
  const [time, setTime] = useState(() => {
    const now = new Date()
    return now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
  })
  const [date] = useState(() => {
    const now = new Date()
    return now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  })

  return (
    <header style={{
      height: 60,
      background: 'white',
      borderBottom: '1px solid #f3f4f6',
      display: 'flex',
      alignItems: 'center',
      paddingInline: '20px',
      gap: 16,
      position: 'fixed',
      top: 0,
      left: 260,
      right: 0,
      zIndex: 20,
    }}>

      {/* Search */}
      <div style={{
        flex: 1,
        maxWidth: 440,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        background: '#f9fafb',
        border: '1px solid #f3f4f6',
        borderRadius: 10,
        padding: '8px 14px',
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ color: '#9ca3af', flexShrink: 0 }}>
          <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
          <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <input
          placeholder="Search patients, diseases, regions..."
          style={{
            border: 'none',
            background: 'transparent',
            outline: 'none',
            fontSize: 13,
            color: '#374151',
            width: '100%',
          }}
        />
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Date & Time */}
      <div style={{ textAlign: 'right', lineHeight: 1.3 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: 0 }}>{date}</p>
        <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>{time} · GMT+1</p>
      </div>

      {/* Dark mode toggle */}
      <button
        onClick={() => setDarkMode(d => !d)}
        style={{
          width: 36, height: 36, borderRadius: 8,
          border: '1px solid #f3f4f6',
          background: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: '#6b7280',
        }}
      >
        {darkMode ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2"/>
            <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>

      {/* Notifications */}
      <button style={{
        width: 36, height: 36, borderRadius: 8,
        border: '1px solid #f3f4f6',
        background: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', color: '#6b7280',
        position: 'relative',
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        {/* Badge */}
        <span style={{
          position: 'absolute', top: 6, right: 6,
          width: 8, height: 8, borderRadius: '50%',
          background: '#ef4444',
          border: '2px solid white',
        }} />
      </button>

      {/* User avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'linear-gradient(135deg, #0891b2, #0e7490)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 700, color: 'white',
        }}>
          A
        </div>
        <div style={{ lineHeight: 1.3 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: 0 }}>Admin</p>
          <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>Administrator</p>
        </div>
      </div>

    </header>
  )
}