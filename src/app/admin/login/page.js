'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { logActivity } from '@/lib/services/activity.service'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState(null)
  const [loading, setLoading]   = useState(false)
  const [mounted, setMounted]   = useState(false)

  // Delay rendering the inputs by one tick so the browser
  // has no static value to autofill on page load
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    await logActivity({
      action:      'login',
      entity:      'auth',
      description: `Admin signed in`,
      adminEmail:  data.user?.email || email,
    })

    router.push('/admin')
    router.refresh()
  }

  const inputStyle = {
    width: '100%', padding: '0.65rem 0.85rem',
    background: '#0f172a', border: '1px solid #334155',
    borderRadius: '8px', color: '#f8fafc', fontSize: '0.95rem',
    outline: 'none', boxSizing: 'border-box',
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0f172a',
    }}>
      <div style={{
        background: '#1e293b',
        padding: '2.5rem',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
      }}>
        <h1 style={{ color: '#f8fafc', fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.25rem' }}>
          YVU Admin
        </h1>
        <p style={{ color: '#94a3b8', marginBottom: '2rem', fontSize: '0.9rem' }}>
          Sign in to manage YouthVerse Union
        </p>

        <form onSubmit={handleLogin} autoComplete="off">
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
              Email
            </label>
            {mounted ? (
              <input
                key="email-real"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="off"
                data-lpignore="true"
                data-form-type="other"
                style={inputStyle}
              />
            ) : (
              <input
                key="email-dummy"
                type="text"
                readOnly
                style={inputStyle}
              />
            )}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
              Password
            </label>
            {mounted ? (
              <input
                key="password-real"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="off"
                data-lpignore="true"
                data-form-type="other"
                style={inputStyle}
              />
            ) : (
              <input
                key="password-dummy"
                type="password"
                readOnly
                style={inputStyle}
              />
            )}
          </div>

          {error && (
            <div style={{
              background: '#450a0a', border: '1px solid #991b1b',
              color: '#fca5a5', padding: '0.75rem', borderRadius: '8px',
              marginBottom: '1rem', fontSize: '0.85rem',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '0.75rem',
              background: loading ? '#334155' : '#6366f1',
              color: '#fff', border: 'none', borderRadius: '8px',
              fontSize: '1rem', fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}