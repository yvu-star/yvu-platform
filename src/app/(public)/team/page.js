export const dynamic = 'force-dynamic';

// src/app/team/page.js
// Server Component — fetches active team members and site settings from Supabase

import { createClient } from '@/lib/supabase/server';
import TeamClient from '@/components/ui/TeamClient';
import './team.css';

export const metadata = {
  title: 'Our Team — YouthVerse Union',
  description:
    'Meet the passionate young leaders, researchers, and organizers behind YouthVerse Union working to empower youth across South Asia.',
};

async function getTeamData() {
  try {
    const supabase = await createClient();

    const [{ data: rawSettings }, { data: members, error }] = await Promise.all([
      supabase.from('site_settings').select('key, value'),
      supabase
        .from('team_members')
        .select(
          'id, name, role, bio, country, team_group, image_url, linkedin_url, facebook_url, instagram_url, portfolio_url, email, display_order, is_active'
        )
        .eq('is_active', true)
        .order('display_order', { ascending: true }),
    ]);

    if (error) console.error('[Team] Fetch error:', error.message);

    const s = Object.fromEntries((rawSettings || []).map((r) => [r.key, r.value]));

    const foundingTeam = (members || []).filter(
      (m) => m.team_group === 'Founding Leadership Team'
    );
    const opsTeam = (members || []).filter(
      (m) => m.team_group === 'Global Operations Team'
    );

    return { s, foundingTeam, opsTeam };
  } catch (err) {
    console.error('[Team] Fetch failed:', err.message);
    return { s: {}, foundingTeam: [], opsTeam: [] };
  }
}

export default async function TeamPage() {
  const { s, foundingTeam, opsTeam } = await getTeamData();

  return (
    <main>
      {/* ── Hero — no badge, no scroll icon ── */}
      <section className="tm-hero">
        <div className="tm-hero-inner">
          {/* tm-hero-badge intentionally removed */}
          <h1 className="tm-hero-title">
            {s.team_hero_title ?? 'Meet Our Team'}
          </h1>
          <p className="tm-hero-desc">
            {s.team_hero_content ??
              'A passionate, global team of young leaders committed to inspiring minds and building a brighter future for youth across South Asia and beyond.'}
          </p>
          {/* tm-hero-scroll intentionally removed */}
        </div>
      </section>

      {/* ── Team sections + modal ── */}
      <TeamClient
        foundingTeam={foundingTeam}
        opsTeam={opsTeam}
        ctaTitle={s.team_cta_title ?? 'Want to Join Our Team?'}
        heroTitle={s.team_hero_title ?? 'Meet Our Team'}
        heroContent={s.team_hero_content ?? 'A passionate, global team of young leaders committed to inspiring minds and building a brighter future for youth across South Asia and beyond.'}
        heroKicker={s.team_hero_kicker ?? 'The People Behind the Mission'}
      />
    </main>
  );
}