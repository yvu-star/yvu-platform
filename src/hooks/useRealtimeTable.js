'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRealtime } from './useRealtime'

export function useRealtimeTable(fetchFn, table) {
  const [data, setData]       = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const fetchFnRef  = useRef(fetchFn)
  const debounceRef = useRef(null)

  useEffect(() => {
    fetchFnRef.current = fetchFn
  })

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await fetchFnRef.current()
      setData(result)
    } catch (err) {
      console.error(`Error fetching ${table}:`, err.message)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [table])

  // Initial load — immediate, no debounce
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Realtime callback — debounced so rapid Supabase events
  // (e.g. bulk saves, quick back-to-back edits) collapse into
  // a single refetch instead of hammering the DB.
  const debouncedFetch = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetchData()
    }, 300)
  }, [fetchData])

  // Clean up any pending debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  useRealtime(table, debouncedFetch)

  return { data, loading, error, refetch: fetchData }
}