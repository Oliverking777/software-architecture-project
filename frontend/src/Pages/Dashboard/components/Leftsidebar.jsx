import { useNavigate } from 'react-router-dom'

const BLUE = '#2746F5'
const BLUE_DARK = '#1e38d0'
const BLUE_LIGHT = 'rgba(255,255,255,0.12)'
const BLUE_HOVER = 'rgba(255,255,255,0.08)'

const monitoringItems = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2"/>
        <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2"/>
        <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2"/>
        <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
  },
  {
    label: 'Patients',
    path: '#',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
  },
  {
    label: 'Diseases',
    path: '#',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    label: 'Locations',
    path: '#',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
  },
  {
    label: 'Analytics',
    path: '#',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <line x1="18" y1="20" x2="18" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <line x1="12" y1="20" x2="12" y2="4"  stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <line x1="6"  y1="20" x2="6"  y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: 'Alerts',
    path: '#',
    badge: 3,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: 'Reports',
    path: '#',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2"/>
        <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2"/>
        <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: 'GIS Maps',
    path: '#',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="8"  y1="2"  x2="8"  y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <line x1="16" y1="6"  x2="16" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
]

const bottomItems = [
  {
    label: 'Notifications',
    path: '#',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: 'Profile',
    path: '#',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
  },
  {
    label: 'Settings',
    path: '#',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
  },
]

export default function LeftSidebar({ activeItem, onItemClick }) {
  const navigate = useNavigate()

  const NavItem = ({ item }) => {
    const isActive = activeItem === item.label
    return (
      <button
        onClick={() => {
          onItemClick?.(item.label)
          if (item.path !== '#') navigate(item.path)
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '9px 12px',
          borderRadius: 8,
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          fontSize: 14,
          fontWeight: isActive ? 600 : 400,
          background: isActive ? BLUE_LIGHT : 'transparent',
          color: '#fff',
          width: '100%',
          position: 'relative',
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => {
          if (!isActive) e.currentTarget.style.background = BLUE_HOVER
        }}
        onMouseLeave={e => {
          if (!isActive) e.currentTarget.style.background = 'transparent'
        }}
      >
        {/* Active indicator bar */}
        {isActive && (
          <span style={{
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 3,
            height: 20,
            background: '#fff',
            borderRadius: '0 3px 3px 0',
          }} />
        )}
        <span style={{ color: isActive ? '#fff' : 'rgba(255,255,255,0.65)', display: 'flex' }}>
          {item.icon}
        </span>
        <span style={{ flex: 1, color: isActive ? '#fff' : 'rgba(255,255,255,0.8)' }}>{item.label}</span>
        {item.badge && (
          <span style={{
            background: '#ef4444',
            color: 'white',
            fontSize: 11,
            fontWeight: 700,
            width: 20, height: 20,
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {item.badge}
          </span>
        )}
      </button>
    )
  }

  return (
    <aside style={{
      width: 260,
      background: BLUE,
      borderRight: 'none',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      top: 0,
      left: 0,
      height: '100vh',
      zIndex: 30,
    }}>

      {/* ── Logo ── */}
      <div style={{
        height: 60,
        padding: '0 20px',
        borderBottom: '1px solid rgba(255,255,255,0.12)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        flexShrink: 0,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'rgba(255,255,255,0.18)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <p style={{ fontWeight: 700, fontSize: 15, color: '#fff', margin: 0 }}>DSAS</p>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', margin: 0 }}>Disease Surveillance</p>
        </div>
      </div>

      {/* ── Nav ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 12px 8px' }}>
        <p style={{
          fontSize: 10,
          fontWeight: 700,
          color: 'rgba(255,255,255,0.4)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          margin: '0 0 8px 12px',
        }}>
          MONITORING
        </p>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {monitoringItems.map(item => <NavItem key={item.label} item={item}/>)}
        </nav>

        <div style={{ height: 1, background: 'rgba(255,255,255,0.12)', margin: '12px 0' }} />

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {bottomItems.map(item => <NavItem key={item.label} item={item}/>)}
        </nav>
      </div>

    </aside>
  )
}