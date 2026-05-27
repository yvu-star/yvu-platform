import { createClient } from '@/lib/supabase/client';

const TABLE = 'activity_logs';

// Log an admin action
export async function logActivity({ action, entity, entityId, description, adminEmail, metadata }) {
  const supabase = createClient();

  const { error } = await supabase.from(TABLE).insert({
    action,
    entity,
    entity_id: entityId ? String(entityId) : null,
    description,
    admin_email: adminEmail || null,
    metadata: metadata || null,
  });

  if (error) {
    // Never throw — logging should never break the main action
    console.warn('[ActivityLog] Failed to log:', error.message);
  }
}

// Fetch recent logs (default: latest 50)
export async function getActivityLogs(limit = 50) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

// Fetch logs for a specific entity (e.g., all logs for 'events')
export async function getLogsForEntity(entity, limit = 20) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('entity', entity)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

// Delete logs older than 90 days (call from settings/cleanup)
export async function pruneOldLogs() {
  const supabase = createClient();

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90);

  const { error } = await supabase
    .from(TABLE)
    .delete()
    .lt('created_at', cutoff.toISOString());

  if (error) throw error;
}