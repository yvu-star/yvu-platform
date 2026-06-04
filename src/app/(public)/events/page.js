import { createClient } from '@/lib/supabase/server';
import EventsClient from '@/components/ui/EventsClient';
import './events.css';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export default async function EventsPage() {
  const supabase = await createClient();

  const [settingsRes, upcomingRes, ongoingRes, pastRes] = await Promise.all([
    supabase.from('site_settings').select('key, value'),
    supabase
      .from('events')
      .select('*')
      .eq('is_published', true)
      .eq('status', 'Upcoming')
      .order('event_date', { ascending: false })
      .limit(5),
    supabase
      .from('events')
      .select('*')
      .eq('is_published', true)
      .eq('status', 'Ongoing')
      .order('event_date', { ascending: false }),
    supabase
      .from('events')
      .select('*')
      .eq('is_published', true)
      .eq('status', 'Completed')
      .order('event_date', { ascending: false })
      .limit(20),
  ]);

  const s = Object.fromEntries(
    ((settingsRes.data) || []).map((r) => [r.key, r.value])
  );
  const upcomingEvents = upcomingRes.data || [];
  const ongoingEvents  = ongoingRes.data  || [];
  const pastEvents     = pastRes.data     || [];

  // Featured = first ongoing or upcoming with is_featured=true, fallback to first ongoing/upcoming
  const featuredEvent =
    [...ongoingEvents, ...upcomingEvents].find((e) => e.is_featured) ||
    ongoingEvents[0] ||
    upcomingEvents[0] ||
    null;

  return (
    <EventsClient
      settings={s}
      featuredEvent={featuredEvent}
      ongoingEvents={ongoingEvents}
      upcomingEvents={upcomingEvents}
      pastEvents={pastEvents}
    />
  );
}