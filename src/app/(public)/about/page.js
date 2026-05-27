import { createClient } from '@/lib/supabase/server';
import AboutClient from '@/components/ui/AboutClient';
import './about.css';

export const metadata = {
  title: 'About — YouthVerse Union',
  description: 'Learn about YouthVerse Union, our story, mission, vision, and the milestones that define our journey.',
};

export default async function AboutPage() {
  const supabase = await createClient();

  const [{ data: rawSettings }, { data: timeline }, { data: coreValues }] = await Promise.all([
    supabase.from('site_settings').select('key, value'),
    supabase.from('timeline').select('*').eq('is_active', true).order('display_order', { ascending: true }),
    supabase.from('core_values').select('*').eq('is_active', true).order('sort_order', { ascending: true }),
  ]);

  const s = Object.fromEntries((rawSettings || []).map(r => [r.key, r.value]));

  return (
    <AboutClient
      settings={s}
      coreValues={coreValues || []}
      timeline={timeline || []}
    />
  );
}