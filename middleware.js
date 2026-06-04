import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  )

  // Always verify the session directly — do not rely on cookie name sniffing.
  // getUser() validates the JWT with Supabase servers; if there's no valid
  // session it returns null regardless of what cookies exist in the browser.
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    // No valid session — clear any stale auth cookies and redirect to login
    const loginUrl = new URL('/admin/login', request.url)
    const redirectResponse = NextResponse.redirect(loginUrl)

    request.cookies.getAll().forEach(({ name }) => {
      if (name.startsWith('sb-')) {
        redirectResponse.cookies.set(name, '', { maxAge: 0, path: '/' })
      }
    })

    return redirectResponse
  }

  // Valid session — allow through
  return supabaseResponse
}

export const config = {
  matcher: ['/admin', '/admin/((?!login).*)'],
}