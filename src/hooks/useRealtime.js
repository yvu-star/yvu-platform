'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()

/**
 * useRealtime — subscribes to real-time changes on a Supabase table.
 *
 * @param {string} table      — the table name to watch (e.g. 'events')
 * @param {function} onChange — callback fired on INSERT, UPDATE, or DELETE
 *
 * Usage:
 *   useRealtime('events', () => fetchEvents())
 */
export function useRealtime(table, onChange) {
  const onChangeRef = useRef(onChange)

  // Keep the ref up to date without re-subscribing
  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    if (!table) return

    const channel = supabase
      .channel(`realtime:${table}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        (payload) => {
          onChangeRef.current(payload)
        }
      )
      .subscribe()

    // Cleanup: unsubscribe when component unmounts
    return () => {
      supabase.removeChannel(channel)
    }
  }, [table])
}