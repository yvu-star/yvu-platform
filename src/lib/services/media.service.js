import { createClient } from '@/lib/supabase/client'

export async function getAllMedia() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('media')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createMedia(payload) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('media')
    .insert([payload])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateMedia(id, payload) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('media')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteMedia(id) {
  const supabase = createClient()
  const { error } = await supabase
    .from('media')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export async function getMediaByCategory(category) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('media')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}