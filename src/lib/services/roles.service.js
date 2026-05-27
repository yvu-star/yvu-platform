import { createClient } from '@/lib/supabase/client'

export async function getAllRoles() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('roles')
    .select('*')
    .order('display_order', { ascending: true })
  if (error) throw error
  return data
}

export async function createRole(payload) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('roles')
    .insert([payload])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateRole(id, payload) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('roles')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteRole(id) {
  const supabase = createClient()
  const { error } = await supabase
    .from('roles')
    .delete()
    .eq('id', id)
  if (error) throw error
}