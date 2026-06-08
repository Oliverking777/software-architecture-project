import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const statsData = [
  { label: 'Cases Tracked', value: '18,412', change: '+2.4% this week', color: '#0891b2' },
  { label: 'Active Outbreaks', value: '7', change: '+1 this week', color: '#ef4444' },
  { label: 'Regions Monitored', value: '10', change: 'No change', color: '#374151' },
  { label: 'Diseases Tracked', value: '47', change: '+3 this week', color: '#7c3aed' },
]

const alerts = [
  { region: 'Centre', disease: 'Cholera', severity: 'High', cases: 312, status: 'Active' },
  { region: 'Littoral', disease: 'Mpox', severity: 'Medium', cases: 87, status: 'Monitoring' },
  { region: 'Nord', disease: 'Meningitis', severity: 'Low', cases: 24, status: 'Contained' },
  { region: 'Adamaoua', disease: 'Yellow Fever', severity: 'Medium', cases: 51, status: 'Active' },
  { region: 'Sud-Ouest', disease: 'Dengue', severity: 'Low', cases: 19, status: 'Monitoring' },
]

const severityColors = {
  High:   { bg: '#fef2f2', text: '#dc2626' },
  Medium: { bg: '#fffbeb', text: '#d97706' },
  Low:    { bg: '#f0fdf4', text: '#16a34a' },
}

const statusColors = {
  Active:     '#ef4444',
  Monitoring: '#f59e0b',
  Contained:  '#22c55e',
}

const navItems = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Surveillance', path: '#' },
  { label: 'Outbreaks', path: '#' },
  { label: 'Regions', path: '#' },
  { label: 'Reports', path: '#' },
  { label: 'Settings', path: '#' },
]

const NavIcon = ({ label }) => {
  const icons = {
    Dashboard: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/><rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/><rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/><rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/></svg>,
    Surveillance: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    Outbreaks: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" strokeWidth="2"/><line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
    Regions: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="2"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="currentColor" strokeWidth="2"/></svg>,
    Reports: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2"/><polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2"/><line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2"/><line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2"/></svg>,
    Settings: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="2"/></svg>,
  }
  return icons[label] || null
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [activeNav, setActiveNav] = useState('Dashboard')

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f9fafb', fontFamily: 'system-ui, sans-serif' }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: 240, background: 'white',
        borderRight: '1px solid #f3f4f6',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', height: '100vh', zIndex: 10,
      }}>
        {/* Logo */}
        <div style={{ padding: '20px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #0891b2, #0e7490)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: 14, color: '#111827', margin: 0 }}>DSAS</p>
            <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>Ministry of Health</p>
          </div>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {navItems.map((item) => {
            const active = activeNav === item.label
            return (
              <button
                key={item.label}
                onClick={() => setActiveNav(item.label)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 10, border: 'none',
                  cursor: 'pointer', textAlign: 'left', fontSize: 14, fontWeight: 500,
                  background: active ? '#ecfeff' : 'transparent',
                  color: active ? '#0891b2' : '#6b7280',
                  width: '100%',
                }}
              >
                <NavIcon label={item.label} />
                {item.label}
              </button>
            )
          })}
        </nav>

        {/* User */}
        <div style={{ padding: '16px', borderTop: '1px solid #f3f4f6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: '#ecfeff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="#0891b2" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="12" cy="7" r="4" stroke="#0891b2" strokeWidth="2"/>
              </svg>
            </div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#111827', margin: 0 }}>Admin User</p>
              <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>dsasadmin@gmail.com</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/login')}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 10px', border: 'none', borderRadius: 8,
              cursor: 'pointer', background: 'transparent', color: '#6b7280', fontSize: 13,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#dc2626' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6b7280' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={{ marginLeft: 240, flex: 1, padding: '32px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>Dashboard</h1>
            <p style={{ color: '#9ca3af', fontSize: 13, margin: 0 }}>Live surveillance overview — updated just now</p>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#f0fdf4', border: '1px solid #bbf7d0',
            borderRadius: 999, padding: '6px 14px',
          }}>
            <span style={{ width: 8, height: 8, background: '#22c55e', borderRadius: '50%', display: 'inline-block' }} />
            <span style={{ color: '#15803d', fontSize: 13, fontWeight: 500 }}>All systems operational</span>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18, marginBottom: 28 }}>
          {statsData.map((stat) => (
            <div key={stat.label} style={{
              background: 'white', border: '1px solid #f3f4f6',
              borderRadius: 16, padding: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', letterSpacing: 1, textTransform: 'uppercase', margin: '0 0 12px' }}>{stat.label}</p>
              <p style={{ fontSize: 32, fontWeight: 800, color: stat.color, margin: '0 0 6px' }}>{stat.value}</p>
              <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>{stat.change}</p>
            </div>
          ))}
        </div>

        {/* Bottom grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>

          {/* Alerts table */}
          <div style={{ background: 'white', border: '1px solid #f3f4f6', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f9fafb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 2px' }}>Active Disease Alerts</h2>
                <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>Across all monitored regions</p>
              </div>
              <span style={{ background: '#fef2f2', color: '#dc2626', fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 999 }}>
                {alerts.filter(a => a.status === 'Active').length} Active
              </span>
            </div>
            {alerts.map((a, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 24px', borderBottom: i < alerts.length - 1 ? '1px solid #fafafa' : 'none',
              }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: statusColors[a.status], flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: '0 0 2px' }}>{a.disease}</p>
                  <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>{a.region} Region</p>
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 999,
                  background: severityColors[a.severity].bg, color: severityColors[a.severity].text,
                }}>{a.severity}</span>
                <div style={{ textAlign: 'right', minWidth: 40 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: '0 0 1px' }}>{a.cases}</p>
                  <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>cases</p>
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: statusColors[a.status], minWidth: 70, textAlign: 'right' }}>{a.status}</span>
              </div>
            ))}
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* Response teams */}
            <div style={{ background: 'white', border: '1px solid #f3f4f6', borderRadius: 16, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 16px' }}>Response Teams</h2>
              {[
                { team: 'Rapid Response Alpha', region: 'Centre', status: 'Deployed' },
                { team: 'Field Team Beta', region: 'Littoral', status: 'On standby' },
                { team: 'Investigation Unit C', region: 'Nord', status: 'Deployed' },
              ].map((t, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  paddingBottom: i < 2 ? 14 : 0, marginBottom: i < 2 ? 14 : 0,
                  borderBottom: i < 2 ? '1px solid #f9fafb' : 'none',
                }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: '0 0 2px' }}>{t.team}</p>
                    <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>{t.region}</p>
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 999,
                    background: t.status === 'Deployed' ? '#f0fdf4' : '#f9fafb',
                    color: t.status === 'Deployed' ? '#16a34a' : '#6b7280',
                  }}>{t.status}</span>
                </div>
              ))}
            </div>

            {/* Critical alert */}
            <div style={{
              borderRadius: 16, padding: 20,
              background: 'linear-gradient(135deg, #0891b2, #155e75)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="white" strokeWidth="2"/>
                  <line x1="12" y1="9" x2="12" y2="13" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="12" y1="17" x2="12.01" y2="17" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>Critical Alert</span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, lineHeight: 1.5, margin: '0 0 16px' }}>
                Cholera cases in Centre region have exceeded the threshold. Escalation recommended.
              </p>
              <button style={{
                background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.3)',
                color: 'white', fontSize: 12, fontWeight: 600, padding: '8px 16px',
                borderRadius: 8, cursor: 'pointer',
              }}>
                View full report →
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}