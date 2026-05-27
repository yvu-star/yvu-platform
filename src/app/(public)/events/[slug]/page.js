export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import './event-detail.css';

const SUPABASE_HOST = 'fsnrnrowvtukaxdfrehq.supabase.co';

function isSupabaseUrl(url) {
  try {
    return url && new URL(url).hostname === SUPABASE_HOST;
  } catch {
    return false;
  }
}

function formatDate(dateStr) {
  if (!dateStr) return null;
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function parseHighlights(raw) {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'string') {
    try { return JSON.parse(raw); } catch { return []; }
  }
  return [];
}

function getStatusClass(status) {
  if (!status) return 'upcoming';
  const s = status.toLowerCase();
  if (s === 'upcoming') return 'upcoming';
  if (s === 'ongoing') return 'ongoing';
  if (s === 'completed') return 'completed';
  return 'upcoming';
}

// ── Inline SVG icons (no client-side icon lib) ───────────
function IconCalendar() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );
}

function IconMapPin() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  );
}

function IconUsers() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}

function IconFormat() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2"/>
      <line x1="8" y1="21" x2="16" y2="21"/>
      <line x1="12" y1="17" x2="12" y2="21"/>
    </svg>
  );
}

function IconArrowLeft() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12"/>
      <polyline points="12 19 5 12 12 5"/>
    </svg>
  );
}

// ── Metadata ─────────────────────────────────────────────
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: event } = await supabase
    .from('events')
    .select('title, short_description')
    .eq('slug', slug)
    .single();
  return {
    title: event?.title ?? 'Event | YouthVerse Union',
    description: event?.short_description ?? '',
  };
}

// ── Page ─────────────────────────────────────────────────
export default async function EventDetailPage({ params }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: event, error } = await supabase
    .from('events')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!event || error) notFound();

  const highlights  = parseHighlights(event.highlights);
  const displayDate = event.display_date || formatDate(event.event_date);
  const eventType   = (event.event_type === 'Other' && event.event_type_other)
    ? event.event_type_other
    : event.event_type;
  const statusClass = getStatusClass(event.status);
  const descriptionText = event.full_description || event.short_description || '';
  const descParagraphs  = descriptionText.split('\n\n').filter(Boolean);

  const hasRegistration = event.registration_url_bd || event.registration_url_intl;

  return (
    <>
      {/* ══════════════════════════════════════════════════
          SECTION 1 — HERO
      ══════════════════════════════════════════════════ */}
      <section className="ed-hero">
        {/* Ambient star layer */}
        <div className="ed-hero-stars" aria-hidden="true" />

        {/* Ambient orb (second) */}
        <div className="ed-hero-orb2" aria-hidden="true" />

        {/* Back navigation */}
        <a href="/events" className="ed-back">
          <IconArrowLeft /> Back to Events
        </a>

        <div className="ed-hero-inner">
          {/* Badges */}
          <div className="ed-hero-badges">
            {eventType && (
              <span className="ed-type-badge">{eventType}</span>
            )}
            {event.status && (
              <span className={`ed-status-badge ${statusClass}`}>
                {event.status}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="ed-hero-title">{event.title}</h1>

          {/* Gold accent line */}
          <span className="ed-hero-title-accent" aria-hidden="true" />

          {/* Meta pills */}
          <div className="ed-hero-meta">
            {displayDate && (
              <span className="ed-meta-item">
                <IconCalendar /> {displayDate}
              </span>
            )}
            {event.location && (
              <span className="ed-meta-item">
                <IconMapPin /> {event.location}
              </span>
            )}
            {event.participants && (
              <span className="ed-meta-item">
                <IconUsers /> {event.participants}
              </span>
            )}
            {event.format && (
              <span className="ed-meta-item">
                <IconFormat /> {event.format}
              </span>
            )}
          </div>

          {/* Floating CTAs inside hero */}
          {hasRegistration && (
            <div className="ed-hero-cta">
              {event.registration_url_bd && (
                <a
                  href={event.registration_url_bd}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ed-hero-btn-primary"
                >
                  Register (Bangladesh) →
                </a>
              )}
              {event.registration_url_intl && (
                <a
                  href={event.registration_url_intl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ed-hero-btn-ghost"
                >
                  Register (International) →
                </a>
              )}
            </div>
          )}
        </div>

        {/* Scroll indicator */}
        <div className="ed-scroll-indicator" aria-hidden="true">
          <span>Scroll</span>
          <div className="ed-scroll-line" />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SECTION 2 — MAIN CONTENT
      ══════════════════════════════════════════════════ */}
      <section className="ed-body">
        <div className="ed-body-inner">

          {/* Left — Description */}
          <div className="ed-about">
            <span className="ed-section-eyebrow">Overview</span>
            <span className="ed-section-heading">About This Event</span>
            <div className="ed-section-divider" aria-hidden="true" />
            {descParagraphs.length > 0
              ? descParagraphs.map((para, i) => (
                  <p key={i} className="ed-about-text">{para}</p>
                ))
              : <p className="ed-about-text">{event.short_description}</p>
            }
          </div>

          {/* Right — Details Card (sticky) */}
          <aside className="ed-details-card">
            <h2 className="ed-card-heading">Event Details</h2>
            <div className="ed-card-divider" aria-hidden="true" />

            {eventType && (
              <div className="ed-detail-row">
                <span className="ed-detail-label">Category</span>
                <span className="ed-detail-value">{eventType}</span>
              </div>
            )}
            {event.format && (
              <div className="ed-detail-row">
                <span className="ed-detail-label">Format</span>
                <span className="ed-detail-value">{event.format}</span>
              </div>
            )}
            {displayDate && (
              <div className="ed-detail-row">
                <span className="ed-detail-label">Date</span>
                <span className="ed-detail-value">{displayDate}</span>
              </div>
            )}
            {event.location && (
              <div className="ed-detail-row">
                <span className="ed-detail-label">Location</span>
                <span className="ed-detail-value">{event.location}</span>
              </div>
            )}
            {event.participants && (
              <div className="ed-detail-row">
                <span className="ed-detail-label">Participants</span>
                <span className="ed-detail-value">{event.participants}</span>
              </div>
            )}
            {event.total_marks && (
              <div className="ed-detail-row">
                <span className="ed-detail-label">Total Marks</span>
                <span className="ed-detail-value">{event.total_marks}</span>
              </div>
            )}
          </aside>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SECTION 3 — HIGHLIGHTS
      ══════════════════════════════════════════════════ */}
      {highlights.length > 0 && (
        <section className="ed-highlights">
          <div className="ed-highlights-header">
            <span className="ed-highlights-pill">Highlights</span>
            <h2 className="ed-highlights-title">Event Highlights</h2>
          </div>

          <div className="ed-highlights-grid">
            {highlights.map((item, i) => (
              <div key={i} className="ed-hl-card">
                <span className="ed-hl-num">{String(i + 1).padStart(2, '0')}</span>
                <span className="ed-hl-text">{item}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════
          SECTION 4 — REGISTRATION
      ══════════════════════════════════════════════════ */}
      {hasRegistration && (
        <section className="ed-register">
          <div className="ed-register-bg" aria-hidden="true" />

          <div className="ed-register-content">
            <div className="ed-reg-pill">Register Now</div>

            <h2 className="ed-reg-title">Ready to Participate?</h2>

            <span className="ed-reg-glow" aria-hidden="true" />

            <p className="ed-reg-sub">
              Secure your spot now. Limited seats available.
            </p>

            <div className="ed-reg-btns">
              {event.registration_url_bd && (
                <a
                  href={event.registration_url_bd}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ed-reg-btn ed-reg-primary"
                >
                  Register (Bangladesh) →
                </a>
              )}
              {event.registration_url_intl && (
                <a
                  href={event.registration_url_intl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ed-reg-btn ed-reg-ghost"
                >
                  Register (International) →
                </a>
              )}
            </div>
          </div>
        </section>
      )}
    </>
  );
}