import { createClient } from '@/lib/supabase/client';

export async function getMessages() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function markMessageRead(id) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('messages')
    .update({ status: 'read' })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function markMessageUnread(id) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('messages')
    .update({ status: 'unread' })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteMessage(id) {
  const supabase = createClient();
  const { error } = await supabase
    .from('messages')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// Used by dashboard for recent messages preview
export async function getRecentMessages(limit = 5) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}