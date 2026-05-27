import { createClient } from '@/lib/supabase/client'

export async function getTeamMembers() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .order('display_order', { ascending: true })
  if (error) throw error
  return data
}

export async function createTeamMember(payload) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('team_members')
    .insert([payload])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateTeamMember(id, payload) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('team_members')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteTeamMember(id) {
  const supabase = createClient()
  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('id', id)
  if (error) throw error
}