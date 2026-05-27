import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export async function getTimeline() {
  const { data, error } = await supabase
    .from('timeline')
    .select('*')
    .order('display_order', { ascending: true })
    .order('year', { ascending: false })

  if (error) throw error
  return data
}

export async function createTimelineEntry(entry) {
  const { data, error } = await supabase
    .from('timeline')
    .insert([entry])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateTimelineEntry(id, updates) {
  const { data, error } = await supabase
    .from('timeline')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteTimelineEntry(id) {
  const { error } = await supabase
    .from('timeline')
    .delete()
    .eq('id', id)

  if (error) throw error
}