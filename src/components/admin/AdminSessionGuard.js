'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  )
}

export default function AdminSessionGuard() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    // Immediately verify session on mount — if no valid session, redirect to login right away
    const checkSession = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/admin/login')
      }
    }
    checkSession()

    // Sign out and redirect on tab/window close
    const handleUnload = () => supabase.auth.signOut()
    window.addEventListener('beforeunload', handleUnload)

    // Also sign out when the tab becomes hidden (catches mobile + most browsers)
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'hidden') {
        await supabase.auth.signOut()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Verify the session is still valid every time the tab regains focus
    const handleFocus = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/admin/login')
      }
    }
    window.addEventListener('focus', handleFocus)

    return () => {
      window.removeEventListener('beforeunload', handleUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [router])

  return null
}