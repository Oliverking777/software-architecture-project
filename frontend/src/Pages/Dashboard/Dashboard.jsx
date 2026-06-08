import { useState } from 'react'
import LeftSidebar from './components/Leftsidebar'
import NavBar from './components/NavBar'

const statsData = [
  {
    label: 'TOTAL CASES',
    value: '18,472',
    change: '4.2%',
    direction: 'up',
    note: 'vs. previous period',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="#0891b2" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="12" cy="7" r="4" stroke="#0891b2" strokeWidth="2"/>
      </svg>
    ),
    iconBg: '#ecfeff',
  },
  {
    label: 'ACTIVE ALERTS',
    value: '23',
    change: '8.1%',
    direction: 'down',
    note: 'vs. previous period',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="#ef4444" strokeWidth="2"/>
        <line x1="12" y1="9" x2="12" y2="13" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
        <line x1="12" y1="17" x2="12.01" y2="17" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    iconBg: '#fef2f2',
  },
  {
    label: 'DISEASES',
    value: '47',
    change: '2.0%',
    direction: 'up',
    note: 'vs. previous period',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    iconBg: '#f5f3ff',
  },
  {
    label: 'AFFECTED REGIONS',
    value: '10/10',
    change: null,
    note: 'Nationwide coverage',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" stroke="#f59e0b" strokeWidth="2"/>
        <circle cx="12" cy="10" r="3" stroke="#f59e0b" strokeWidth="2"/>
      </svg>
    ),
    iconBg: '#fffbeb',
  },
  {
    label: 'CASES THIS WEEK',
    value: '1,284',
    change: '12.4%',
    direction: 'up',
    note: 'vs. previous period',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="18" rx="2" stroke="#f59e0b" strokeWidth="2"/>
        <line x1="16" y1="2" x2="16" y2="6" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"/>
        <line x1="8" y1="2" x2="8" y2="6" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"/>
        <line x1="3" y1="10" x2="21" y2="10" stroke="#f59e0b" strokeWidth="2"/>
      </svg>
    ),
    iconBg: '#fffbeb',
  },
  {
    label: 'CASES THIS MONTH',
    value: '5,318',
    change: '3.2%',
    direction: 'down',
    note: 'vs. previous period',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <polyline points="17 6 23 6 23 12" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    iconBg: '#f0fdf4',
  },
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

// Simple mini line chart using SVG path
function MiniLineChart({ color = '#0891b2', bgColor = '#ecfeff' }) {
  const points = [20, 45, 30, 55, 40, 35, 60, 50, 70, 55, 80, 65, 95, 75, 110]
  const max = Math.max(...points)
  const min = Math.min(...points)
  const h = 60
  const w = 200
  const coords = points.map((p, i) => {
    const x = (i / (points.length - 1)) * w
    const y = h - ((p - min) / (max - min)) * (h - 10) - 5
    return `${x},${y}`
  })
  const pathD = `M ${coords.join(' L ')}`
  const areaD = `M 0,${h} L ${coords.join(' L ')} L ${w},${h} Z`

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
      <defs>
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#grad-${color.replace('#', '')})`}/>
      <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// Donut chart
function DonutChart() {
  const data = [
    { label: 'Cholera', value: 35, color: '#0891b2' },
    { label: 'Mpox', value: 25, color: '#ef4444' },
    { label: 'Dengue', value: 20, color: '#f59e0b' },
    { label: 'Other', value: 20, color: '#e5e7eb' },
  ]
  const total = data.reduce((s, d) => s + d.value, 0)
  let cumulative = 0
  const radius = 60
  const cx = 80, cy = 80
  const circumference = 2 * Math.PI * radius

  const slices = data.map(d => {
    const pct = d.value / total
    const offset = circumference * (1 - cumulative - pct)
    const dasharray = `${circumference * pct} ${circumference * (1 - pct)}`
    cumulative += pct
    return { ...d, dasharray, offset }
  })

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <svg width={160} height={160} viewBox="0 0 160 160">
        {slices.map((s, i) => (
          <circle
            key={i}
            cx={cx} cy={cy} r={radius}
            fill="none"
            stroke={s.color}
            strokeWidth={24}
            strokeDasharray={s.dasharray}
            strokeDashoffset={s.offset}
            style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px` }}
          />
        ))}
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize="18" fontWeight="700" fill="#111827">47</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize="10" fill="#9ca3af">diseases</text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {data.map(d => (
          <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: '#6b7280' }}>{d.label}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#111827', marginLeft: 'auto' }}>{d.value}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [activeNav, setActiveNav] = useState('Dashboard')

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f9fafb', fontFamily: 'system-ui, sans-serif' }}>

      {/* ── Section 1: Left Sidebar ── */}
      <LeftSidebar activeItem={activeNav} onItemClick={setActiveNav} />

      {/* ── Section 2: Top NavBar ── */}
      <NavBar />

      {/* ── Section 3: Main Content ── */}
      <main style={{
        marginLeft: 260,
        marginTop: 60,
        flex: 1,
        padding: '28px 32px',
        minHeight: 'calc(100vh - 60px)',
      }}>

        {/* Page header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>Executive Dashboard</h1>
            <p style={{ color: '#9ca3af', fontSize: 13, margin: 0 }}>Real-time surveillance overview across all regions and reporting units.</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '9px 18px', borderRadius: 8,
              border: '1px solid #e5e7eb', background: 'white',
              fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'pointer',
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <polyline points="7 10 12 15 17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Export
            </button>
            <button style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '9px 18px', borderRadius: 8,
              border: 'none', background: '#0891b2',
              fontSize: 13, fontWeight: 600, color: 'white', cursor: 'pointer',
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              New Report
            </button>
          </div>
        </div>

        {/* ── Stats grid (6 cards) ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: 14,
          marginBottom: 24,
        }}>
          {statsData.map((stat) => (
            <div key={stat.label} style={{
              background: 'white',
              border: '1px solid #f3f4f6',
              borderRadius: 14,
              padding: '18px 16px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.06em', margin: 0 }}>{stat.label}</p>
                <div style={{
                  width: 34, height: 34, borderRadius: 8,
                  background: stat.iconBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  {stat.icon}
                </div>
              </div>
              <p style={{ fontSize: 26, fontWeight: 800, color: '#111827', margin: '0 0 6px' }}>{stat.value}</p>
              <div>
                {stat.change && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 3,
                    fontSize: 11, fontWeight: 600,
                    color: stat.direction === 'up' ? '#16a34a' : '#dc2626',
                    marginRight: 4,
                  }}>
                    {stat.direction === 'up' ? '▲' : '▼'} {stat.change}
                  </span>
                )}
                <span style={{ fontSize: 11, color: '#9ca3af' }}>{stat.note}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Bottom grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>

          {/* Weekly Case Trend */}
          <div style={{ background: 'white', border: '1px solid #f3f4f6', borderRadius: 14, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 3px' }}>Weekly Case Trend</h2>
                <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>Cases, recoveries and fatalities — last 7 days</p>
              </div>
              <div style={{ display: 'flex', gap: 14 }}>
                {[{ label: 'Cases', color: '#0891b2' }, { label: 'Recovered', color: '#22c55e' }, { label: 'Deaths', color: '#ef4444' }].map(l => (
                  <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: l.color }} />
                    <span style={{ fontSize: 11, color: '#6b7280' }}>{l.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[
                { color: '#0891b2', bg: '#ecfeff' },
                { color: '#22c55e', bg: '#f0fdf4' },
                { color: '#ef4444', bg: '#fef2f2' },
              ].map((c, i) => (
                <MiniLineChart key={i} color={c.color} bgColor={c.bg} />
              ))}
            </div>
          </div>

          {/* Disease Distribution */}
          <div style={{ background: 'white', border: '1px solid #f3f4f6', borderRadius: 14, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 3px' }}>Disease Distribution</h2>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: '0 0 16px' }}>Active cases by disease</p>
            <DonutChart />
          </div>

          {/* Alerts table */}
          <div style={{ background: 'white', border: '1px solid #f3f4f6', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #f9fafb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                padding: '13px 24px',
                borderBottom: i < alerts.length - 1 ? '1px solid #fafafa' : 'none',
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Response teams */}
            <div style={{ background: 'white', border: '1px solid #f3f4f6', borderRadius: 14, padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 16px' }}>Response Teams</h2>
              {[
                { team: 'Rapid Response Alpha', region: 'Centre', status: 'Deployed' },
                { team: 'Field Team Beta', region: 'Littoral', status: 'On standby' },
                { team: 'Investigation Unit C', region: 'Nord', status: 'Deployed' },
              ].map((t, i, arr) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  paddingBottom: i < arr.length - 1 ? 14 : 0,
                  marginBottom: i < arr.length - 1 ? 14 : 0,
                  borderBottom: i < arr.length - 1 ? '1px solid #f9fafb' : 'none',
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

            {/* Critical alert card */}
            <div style={{
              borderRadius: 14, padding: '20px',
              background: 'linear-gradient(135deg, #0891b2, #155e75)',
              flex: 1,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="white" strokeWidth="2"/>
                  <line x1="12" y1="9" x2="12" y2="13" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="12" y1="17" x2="12.01" y2="17" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>Critical Alert</span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, lineHeight: 1.6, margin: '0 0 16px' }}>
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