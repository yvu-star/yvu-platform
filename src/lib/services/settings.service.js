import { createClient } from '@/lib/supabase/client';

/**
 * Fetch all site_settings rows whose key starts with the given prefix.
 * Returns a plain object: { key: value, ... } (keys include the prefix).
 */
export async function getSettingsByPrefix(prefix) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('site_settings')
    .select('key, value')
    .like('key', prefix + '%');
  if (error) throw error;
  return Object.fromEntries((data || []).map((r) => [r.key, r.value]));
}

/**
 * Upsert an object of { key: value } pairs into site_settings.
 * Uses onConflict('key') to update existing rows.
 */
export async function upsertSettings(keyValueObj) {
  const supabase = createClient();
  const rows = Object.entries(keyValueObj).map(([key, value]) => ({ key, value }));
  if (!rows.length) return;
  const { error } = await supabase
    .from('site_settings')
    .upsert(rows, { onConflict: 'key' });
  if (error) throw error;
}

/**
 * Fetch ALL site_settings as a plain { key: value } object.
 * For use in server components.
 */
export async function getAllSettings(supabase) {
  const { data } = await supabase.from('site_settings').select('key, value');
  return Object.fromEntries((data || []).map((r) => [r.key, r.value]));
}