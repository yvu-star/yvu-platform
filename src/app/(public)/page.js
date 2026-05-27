import { createClient } from '@/lib/supabase/server';
import HomeClient from '@/components/ui/HomeClient';
import './page.css';

export default async function HomePage() {
  const supabase = await createClient();

  const [settingsRes, valuesRes, eventsRes] = await Promise.all([
    supabase.from('site_settings').select('key, value'),
    supabase.from('core_values').select('*').eq('is_active', true).order('sort_order', { ascending: true }),
    supabase
      .from('events')
      .select('id, title, slug, event_type, display_date, event_date, location, short_description, highlights')
      .eq('is_published', true)
      .eq('status', 'Upcoming')
      .order('event_date', { ascending: true })
      .limit(3),
  ]);

  const rawSettings = settingsRes.data || [];
  const s = Object.fromEntries(rawSettings.map(r => [r.key, r.value]));

  // Impact stats: find all keys starting with "stat_item_"
  const statItems = rawSettings
    .filter(r => r.key.startsWith('stat_item_'))
    .map(r => { try { return JSON.parse(r.value); } catch (e) { return null; } })
    .filter(Boolean)
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  const coreValues = valuesRes.data || [];
  const upcomingEvents = eventsRes.data || [];

  return (
    <HomeClient
      settings={s}
      statItems={statItems}
      coreValues={coreValues}
      upcomingEvents={upcomingEvents}
    />
  );
}