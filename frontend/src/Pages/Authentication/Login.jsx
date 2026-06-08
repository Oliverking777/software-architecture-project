import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('dsasadmin@gmail.com')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')

  const handleSignIn = (e) => {
    e.preventDefault()
    if (email === 'dsasadmin@gmail.com' && password === 'dsas_password') {
      navigate('/dashboard')
    } else {
      setError('Invalid credentials. Use the demo account below.')
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'system-ui, sans-serif' }}>

      {/* ── Left Panel ── */}
      <div style={{
        width: '55%',
        background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 40%, #155e75 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '40px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Grid overlay */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.08,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          pointerEvents: 'none',
        }} />

        {/* Branding */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'rgba(255,255,255,0.2)',
            border: '1px solid rgba(255,255,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <p style={{ color: 'white', fontWeight: 700, fontSize: 18, margin: 0, letterSpacing: 1 }}>DSAS</p>
            <p style={{ color: '#a5f3fc', fontSize: 12, margin: 0 }}>Ministry of Public Health</p>
          </div>
        </div>

        {/* Center hero */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Live badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.22)',
            borderRadius: 999, padding: '6px 16px', marginBottom: 28,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
            <span style={{ color: 'white', fontSize: 13, fontWeight: 500 }}>Live surveillance · 24/7</span>
          </div>

          <h1 style={{ color: 'white', fontSize: 48, fontWeight: 800, lineHeight: 1.1, margin: '0 0 16px' }}>
            National Disease<br />Intelligence<br />Platform
          </h1>
          <p style={{ color: '#cffafe', fontSize: 15, lineHeight: 1.6, maxWidth: 360, margin: 0 }}>
            Monitor outbreaks, detect anomalies, and coordinate public health response across all regions in real time.
          </p>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginTop: 36 }}>
            {[
              { value: '18.4K', label: 'CASES TRACKED' },
              { value: '47', label: 'DISEASES' },
              { value: '10', label: 'REGIONS' },
            ].map((s) => (
              <div key={s.label} style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.18)',
                borderRadius: 14, padding: '16px',
              }}>
                <p style={{ color: 'white', fontSize: 26, fontWeight: 700, margin: '0 0 4px' }}>{s.value}</p>
                <p style={{ color: '#a5f3fc', fontSize: 11, letterSpacing: 1, margin: 0 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#a5f3fc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ color: '#a5f3fc', fontSize: 12 }}>ISO 27001 · End-to-end encrypted · WHO data standards</span>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '48px 24px', background: 'white',
      }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <h2 style={{ fontSize: 30, fontWeight: 800, color: '#111827', margin: '0 0 6px' }}>Welcome back</h2>
          <p style={{ color: '#6b7280', fontSize: 14, margin: '0 0 32px' }}>Sign in to your surveillance account.</p>

          <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Email */}
            <div>
              <label style={labelStyle}>Email</label>
              <div style={{ position: 'relative' }}>
                <span style={iconWrapStyle}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="#9ca3af" strokeWidth="2"/>
                    <polyline points="22,6 12,13 2,6" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError('') }}
                  style={inputStyle}
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={labelStyle}>Password</label>
                <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0891b2', fontSize: 13, fontWeight: 500, padding: 0 }}>
                  Forgot password?
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <span style={iconWrapStyle}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="11" width="18" height="11" rx="2" stroke="#9ca3af" strokeWidth="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError('') }}
                  style={{ ...inputStyle, paddingRight: 44 }}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0, display: 'flex' }}
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2"/>
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                type="button"
                onClick={() => setRemember(!remember)}
                style={{
                  width: 20, height: 20, borderRadius: 5, border: `2px solid ${remember ? '#0891b2' : '#d1d5db'}`,
                  background: remember ? '#0891b2' : 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', padding: 0, flexShrink: 0,
                }}
              >
                {remember && (
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                    <polyline points="2,6 5,9 10,3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
              <span style={{ color: '#374151', fontSize: 14 }}>Remember me for 30 days</span>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: '#fef2f2', border: '1px solid #fecaca',
                borderRadius: 12, padding: '12px 16px',
                display: 'flex', alignItems: 'center', gap: 8,
                color: '#dc2626', fontSize: 13,
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                {error}
              </div>
            )}

            {/* Sign In button */}
            <button
              type="submit"
              style={{
                width: '100%', padding: '14px',
                background: 'linear-gradient(135deg, #0891b2, #0e7490)',
                border: 'none', borderRadius: 12,
                color: 'white', fontWeight: 700, fontSize: 15,
                cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 8,
              }}
            >
              Sign In
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <line x1="5" y1="12" x2="19" y2="12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <polyline points="12,5 19,12 12,19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </form>

          {/* Demo account */}
          <div style={{
            marginTop: 24, background: '#f9fafb',
            border: '1px solid #e5e7eb', borderRadius: 12, padding: 16,
          }}>
            <p style={{ fontWeight: 600, color: '#374151', fontSize: 13, margin: '0 0 4px' }}>Demo account</p>
            <p style={{ color: '#6b7280', fontSize: 12, margin: '0 0 8px' }}>Use these credentials to sign in:</p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', fontFamily: 'monospace', fontSize: 12, color: '#0891b2' }}>
              <span>dsasadmin@gmail.com</span>
              <span style={{ color: '#d1d5db' }}>·</span>
              <span>dsas_password</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const labelStyle = {
  display: 'block', fontSize: 13, fontWeight: 600,
  color: '#374151', marginBottom: 6,
}

const iconWrapStyle = {
  position: 'absolute', left: 14,
  top: '50%', transform: 'translateY(-50%)',
  display: 'flex', alignItems: 'center', pointerEvents: 'none',
}

const inputStyle = {
  width: '100%', paddingLeft: 42, paddingRight: 16,
  paddingTop: 12, paddingBottom: 12,
  border: '1px solid #e5e7eb', borderRadius: 12,
  fontSize: 14, color: '#1f2937',
  outline: 'none', boxSizing: 'border-box',
  fontFamily: 'system-ui, sans-serif',
  background: 'white',
}