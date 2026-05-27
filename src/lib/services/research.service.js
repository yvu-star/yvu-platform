import { createClient } from '@/lib/supabase/client'

export async function getResearch() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('research')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createResearch(payload) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('research')
    .insert([payload])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateResearch(id, payload) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('research')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteResearch(id) {
  const supabase = createClient()
  const { error } = await supabase
    .from('research')
    .delete()
    .eq('id', id)
  if (error) throw error
}