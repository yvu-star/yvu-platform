'use client';

import { useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { logActivity } from '@/lib/services/activity.service';

const supabase = createClient();

export function useActivityLog() {
  const log = useCallback(async ({ action, entity, entityId, description, metadata }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const adminEmail = user?.email ?? 'unknown';

      await logActivity({ action, entity, entityId, description, adminEmail, metadata });
    } catch (err) {
      console.warn('useActivityLog: failed to log activity', err);
    }
  }, []);

  return { log };
}