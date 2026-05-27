import { createBrowserClient } from '@supabase/ssr'

// Singleton — one client instance for the entire browser session.
// Without this, components that call createClient() inside render
// create a new WebSocket connection to Supabase on every re-render,
// which causes duplicate realtime subscriptions and wasted connections.
let client = null

export function createClient() {
  if (client) return client
  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  return client
}