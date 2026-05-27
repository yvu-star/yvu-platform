import { createClient } from '@/lib/supabase/server';
import GetInvolvedClient from '@/components/ui/GetInvolvedClient';
import './gi.css';

export default async function GetInvolvedPage() {
  const supabase = await createClient();

  const [{ data: rawSettings }, { data: volunteerRole }, { data: ambassadorRole }, { data: giCta }] = await Promise.all([
    supabase.from('site_settings').select('key, value'),
    supabase.from('roles').select('*').eq('role_type', 'volunteer').eq('is_active', true).maybeSingle(),
    supabase.from('roles').select('*').eq('role_type', 'ambassador').eq('is_active', true).maybeSingle(),
    supabase.from('gi_cta').select('*')
  ]);

  const s = Object.fromEntries((rawSettings || []).map(r => [r.key, r.value]));
  
  const volunteerCta = (giCta || []).find(c => c.cta_type === 'volunteer') || null;
  const ambassadorCta = (giCta || []).find(c => c.cta_type === 'ambassador') || null;

  return (
    <GetInvolvedClient
      settings={s}
      volunteerRole={volunteerRole}
      ambassadorRole={ambassadorRole}
      volunteerCta={volunteerCta}
      ambassadorCta={ambassadorCta}
    />
  );
}