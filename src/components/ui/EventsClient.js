'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Calendar,
  MapPin,
  Users,
  Globe,
  Trophy,
  ChevronRight,
  Download,
} from 'lucide-react';

// ── Helpers ────────────────────────────────────────────────
function formatDate(dateStr, displayDate) {
  if (displayDate) return displayDate;
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function parseDayMonth(dateStr) {
  if (!dateStr) return { day: '—', month: '' };
  const d = new Date(dateStr);
  return {
    day: d.getDate(),
    month: d.toLocaleString('en-GB', { month: 'short' }).toUpperCase(),
  };
}

function useScrollReveal(options = {}) {
  const refs = useRef([]);
  const [visible, setVisible] = useState(new Set());

  useEffect(() => {
    const observers = [];
    refs.current.forEach((el, i) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisible((prev) => new Set([...prev, i]));
            obs.disconnect();
          }
        },
        { threshold: 0.1, rootMargin: '0px 0px -40px 0px', ...options }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refs.current.length]);

  const setRef = useCallback((i) => (el) => { refs.current[i] = el; }, []);
  return { visible, setRef };
}

function useTilt(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handleMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      el.style.transform = `perspective(900px) rotateY(${x * 5}deg) rotateX(${-y * 4}deg) translateY(-4px)`;
    };
    const handleLeave = () => { el.style.transform = ''; };
    el.addEventListener('mousemove', handleMove);
    el.addEventListener('mouseleave', handleLeave);
    return () => {
      el.removeEventListener('mousemove', handleMove);
      el.removeEventListener('mouseleave', handleLeave);
    };
  }, [ref]);
}

// ── Tag color helper ───────────────────────────────────────
function tagClass(type) {
  const t = (type || '').toLowerCase();
  if (t.includes('compet')) return 'ev-tag-competition';
  if (t.includes('seminar') || t.includes('workshop')) return 'ev-tag-workshop';
  if (t.includes('research')) return 'ev-tag-research';
  return 'ev-tag-workshop';
}

// ══════════════════════════════════════════════════════════
// SECTION 1: HERO
// ══════════════════════════════════════════════════════════
function HeroSection({ s }) {
  return (
    <section className="ev-hero">
      <div className="ev-hero-inner">
        <h1 className="ev-hero-title ev-anim-fadeup" style={{ animationDelay: '0.1s' }}>
          {s.events_hero_title ?? 'Where Ideas Meet Action'}
        </h1>
        <p className="ev-hero-desc ev-anim-fadeup" style={{ animationDelay: '0.25s' }}>
          {s.events_hero_content ??
            'Competitions, workshops, research symposiums, and transformative programs — discover all that YouthVerse Union has to offer.'}
        </p>
      </div>
      {/* Orbital Event Rings SVG — right-side graphic */}
      <div className="ev-hero-graphic" aria-hidden="true">
        <svg viewBox="0 0 600 600" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <style>{`
            @keyframes ev-slowSpin {
              from { transform: rotate(0deg); }
              to   { transform: rotate(360deg); }
            }
            @keyframes ev-pulse {
              0%, 100% { opacity: 0.6; transform: scale(1); }
              50%       { opacity: 1;   transform: scale(1.15); }
            }
            .ev-svg-outer { transform-origin: 300px 300px; animation: ev-slowSpin 60s linear infinite; }
            .ev-svg-ring2 { transform-origin: 300px 300px; animation: ev-slowSpin 40s linear infinite reverse; }
            .ev-svg-ring3 { transform-origin: 300px 300px; animation: ev-slowSpin 28s linear infinite; }
            .ev-svg-pulse { transform-origin: 300px 300px; animation: ev-pulse 3s ease-in-out infinite; }
          `}</style>

          <g opacity="0.04" stroke="rgba(201,168,76,1)" strokeWidth="0.8">
            {[100,160,220,280,340,400,460,520].map((y, i) => (
              <line key={'h'+i} x1="40" y1={y} x2="560" y2={y}/>
            ))}
            {[100,160,220,280,340,400,460,520].map((x, i) => (
              <line key={'v'+i} x1={x} y1="40" x2={x} y2="560"/>
            ))}
          </g>

          <line x1="80" y1="520" x2="520" y2="80" stroke="rgba(201,168,76,0.07)" strokeWidth="1"/>

          <g className="ev-svg-ring3">
            <circle cx="300" cy="300" r="90" fill="none" stroke="rgba(201,168,76,0.18)" strokeWidth="1"/>
            <circle cx="300" cy="210" r="5" fill="#c9a84c" filter="drop-shadow(0 0 8px rgba(201,168,76,0.9))"/>
          </g>

          <g className="ev-svg-ring2">
            <circle cx="300" cy="300" r="160" fill="none" stroke="rgba(201,168,76,0.15)" strokeWidth="1" strokeDasharray="6 10"/>
            <circle cx="300" cy="140" r="4" fill="#c9a84c" filter="drop-shadow(0 0 6px rgba(201,168,76,0.6))"/>
            <circle cx="460" cy="300" r="4" fill="rgba(201,168,76,0.5)" filter="drop-shadow(0 0 5px rgba(201,168,76,0.5))"/>
          </g>

          <g className="ev-svg-outer">
            <circle cx="300" cy="300" r="248" fill="none" stroke="rgba(201,168,76,0.20)" strokeWidth="1.2"/>
            <circle cx="300" cy="52" r="4.5" fill="#c9a84c" filter="drop-shadow(0 0 6px rgba(201,168,76,0.6))"/>
            <circle cx="514" cy="424" r="3.5" fill="rgba(201,168,76,0.45)" filter="drop-shadow(0 0 5px rgba(201,168,76,0.5))"/>
            <circle cx="86" cy="424" r="4" fill="#c9a84c" filter="drop-shadow(0 0 6px rgba(201,168,76,0.6))"/>
          </g>

          <line x1="300" y1="272" x2="300" y2="300" stroke="rgba(201,168,76,0.35)" strokeWidth="1.2"/>
          <line x1="320" y1="280" x2="300" y2="300" stroke="rgba(201,168,76,0.35)" strokeWidth="1.2"/>
          <line x1="280" y1="280" x2="300" y2="300" stroke="rgba(201,168,76,0.35)" strokeWidth="1.2"/>
          <line x1="300" y1="328" x2="300" y2="300" stroke="rgba(201,168,76,0.35)" strokeWidth="1.2"/>
          <line x1="328" y1="300" x2="300" y2="300" stroke="rgba(201,168,76,0.35)" strokeWidth="1.2"/>
          <line x1="272" y1="300" x2="300" y2="300" stroke="rgba(201,168,76,0.35)" strokeWidth="1.2"/>
          <line x1="320" y1="320" x2="300" y2="300" stroke="rgba(201,168,76,0.35)" strokeWidth="1.2"/>
          <line x1="280" y1="320" x2="300" y2="300" stroke="rgba(201,168,76,0.35)" strokeWidth="1.2"/>

          <g className="ev-svg-pulse">
            <circle cx="300" cy="300" r="7" fill="#c9a84c" filter="drop-shadow(0 0 10px rgba(201,168,76,0.8))"/>
          </g>
        </svg>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════
// SECTION 2: SPOTLIGHT
// ══════════════════════════════════════════════════════════
function SpotlightSection({ s, event }) {
  if (!event) return null;

  const highlights = Array.isArray(event.highlights)
    ? event.highlights
    : typeof event.highlights === 'string'
    ? (() => { try { return JSON.parse(event.highlights); } catch { return []; } })()
    : [];

  const hasRegistration = event.registration_url_bd || event.registration_url_intl;

  return (
    <section className="ev-spotlight">
      <div className="ev-container">
        <div className="ev-spot-header">
          <div className="ev-spot-pill">● SPOTLIGHT</div>
          <h2 className="ev-spot-title">
            {s.events_spotlight_title ?? 'Event Spotlight'}
          </h2>
          <p className="ev-spot-sub">
            {s.events_spotlight_subtitle ?? 'Our featured ongoing event.'}
          </p>
        </div>

        {/* Featured event title */}
        <h3 className="ev-spot-event-title">{event.title}</h3>

        {highlights.length > 0 && (
          <div className="ev-highlight-grid">
            {highlights.map((hl, i) => (
              <HighlightCard key={i} num={i + 1} text={hl} />
            ))}
          </div>
        )}

        {hasRegistration && (
          <div className="ev-reg-row">
            {event.registration_url_bd && (
              <a
                href={event.registration_url_bd}
                target="_blank"
                rel="noopener noreferrer"
                className="ev-reg-btn"
              >
                Register (Bangladesh) <ArrowRight size={16} className="ev-btn-arrow" />
              </a>
            )}
            {event.registration_url_intl && (
              <a
                href={event.registration_url_intl}
                target="_blank"
                rel="noopener noreferrer"
                className="ev-reg-btn"
              >
                <Globe size={16} /> Register (International)
                <ArrowRight size={16} className="ev-btn-arrow" />
              </a>
            )}
          </div>
        )}

        <Link href={`/events/${event.slug}`} className="ev-view-btn">
          View Full Event Details →
        </Link>
      </div>
    </section>
  );
}

function HighlightCard({ num, text }) {
  const ref = useRef(null);
  useTilt(ref);
  return (
    <div ref={ref} className="ev-hl-card">
      <div className="ev-hl-num">{num}</div>
      <div className="ev-hl-text">{text}</div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// SECTION 3: ONGOING EVENTS
// ══════════════════════════════════════════════════════════
function OngoingSection({ s, events }) {
  if (!events.length) return null;
  const { visible, setRef } = useScrollReveal();

  return (
    <section className="ev-upcoming">
      <div className="ev-container">
        <div className="ev-upcoming-header">
          <div className="ev-up-pill" style={{ background: 'var(--gold)', color: '#000' }}>● ONGOING</div>
          <h2 className="ev-up-title">
            {s.events_ongoing_title ?? 'Happening Now'}
          </h2>
          <p className="ev-up-sub">
            {s.events_ongoing_subtitle ?? 'Events currently in progress.'}
          </p>
        </div>
        <div className="ev-up-list">
          {events.map((ev, i) => (
            <div
              key={ev.id}
              ref={setRef(i)}
              className={`ev-up-card${visible.has(i) ? ' ev-visible' : ''}`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <UpcomingCard event={ev} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════
// SECTION 4: UPCOMING EVENTS
// ══════════════════════════════════════════════════════════
function UpcomingSection({ s, events }) {
  if (!events.length) return null;
  const { visible, setRef } = useScrollReveal();

  return (
    <section className="ev-upcoming">
      <div className="ev-container">
        <div className="ev-upcoming-header">
          <div className="ev-up-pill">UPCOMING</div>
          <h2 className="ev-up-title">
            {s.events_upcoming_title ?? "What's Next"}
          </h2>
          <p className="ev-up-sub">
            {s.events_upcoming_subtitle ?? "Don't miss our next events."}
          </p>
        </div>
        <div className="ev-up-list">
          {events.map((ev, i) => (
            <div
              key={ev.id}
              ref={setRef(i)}
              className={`ev-up-card${visible.has(i) ? ' ev-visible' : ''}`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <UpcomingCard event={ev} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function UpcomingCard({ event }) {
  const { day, month } = parseDayMonth(event.event_date);
  const href = event.slug ? `/events/${event.slug}` : '#';
  return (
    <>
      <div className="ev-up-date">
        <div className="day">{day}</div>
        <div className="month">{month}</div>
      </div>
      <div className="ev-up-info">
        <span className={`ev-up-tag ${tagClass(event.event_type || event.category)}`}>
          {event.event_type || event.category}
        </span>
        <div className="ev-up-title-text">{event.title}</div>
        <div className="ev-up-meta">
          {formatDate(event.event_date, event.display_date)}
          {event.location && ` · ${event.location}`}
        </div>
      </div>
      <Link href={href} className="ev-up-arrow" aria-label="View event">
        <ChevronRight size={16} />
      </Link>
    </>
  );
}

// ══════════════════════════════════════════════════════════
// SECTION 5: PAST EVENTS
// ══════════════════════════════════════════════════════════
function PastSection({ s, events }) {
  if (!events.length) return null;
  const { visible, setRef } = useScrollReveal();

  return (
    <section className="ev-past">
      <div className="ev-container">
        <div className="ev-past-header">
          <div className="ev-past-pill">PAST EVENTS</div>
          <h2 className="ev-past-h2">
            {s.events_past_title ?? "Events We've Hosted"}
          </h2>
          {s.events_past_subtitle && (
            <p className="ev-past-sub">{s.events_past_subtitle}</p>
          )}
        </div>
        <div className="ev-past-list">
          {events.map((ev, i) => (
            <div
              key={ev.id}
              ref={setRef(i)}
              className={`ev-past-event${visible.has(i) ? ' ev-visible' : ''}${ev.is_featured ? ' ev-past-is-featured' : ''}`}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <PastEventCard event={ev} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PastEventCard({ event }) {
  const href = event.slug ? `/events/${event.slug}` : '#';
  return (
    <>
      {event.is_featured && (
        <div className="ev-past-featured-bar">★ FEATURED EVENT</div>
      )}
      <div className="ev-past-left">
        <div className="ev-past-trophy-icon">
          <Trophy size={48} color="var(--gold)" />
        </div>
        <div className="ev-past-name">{event.title}</div>
        <div className="ev-past-badge">{event.event_type || event.category}</div>
      </div>
      <div className="ev-past-right">
        <div className="ev-past-meta-row">
          <span className="ev-past-meta-pill">
            <Calendar size={12} />
            {formatDate(event.event_date, event.display_date)}
          </span>
          {event.location && (
            <span className="ev-past-meta-pill">
              <MapPin size={12} /> {event.location}
            </span>
          )}
          {event.participants && (
            <span className="ev-past-meta-pill">
              <Users size={12} /> {event.participants}
            </span>
          )}
        </div>
        <p className="ev-past-desc">
          {event.short_description || event.description}
        </p>
        <Link href={href} className="ev-past-view-btn">
          <ArrowRight size={14} /> View Details
        </Link>
      </div>
    </>
  );
}

// ══════════════════════════════════════════════════════════
// SECTION 6: CTA
// ══════════════════════════════════════════════════════════
function CtaSection({ s }) {
  return (
    <section className="ev-cta">
      <div className="ev-container">
        <h2 className="ev-cta-title">
          {s.events_cta_title ?? 'Ready to Participate?'}
        </h2>
        <p className="ev-cta-desc">
          {s.events_cta_desc ??
            'Join thousands of young minds competing, collaborating, and growing through YouthVerse Union programs.'}
        </p>
        <div className="ev-cta-btns">
          <a
            href={s.events_cta_primary_url ?? '/events'}
            className="ev-cta-btn-primary"
          >
            {s.events_cta_primary_label ?? 'View All Events'}
            <ArrowRight size={16} />
          </a>
          <a
            href={s.events_cta_secondary_url ?? '/get-involved'}
            className="ev-cta-btn-ghost"
          >
            {s.events_cta_secondary_label ?? 'Get Involved'}
          </a>
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════
// MAIN EXPORT
// ══════════════════════════════════════════════════════════
export default function EventsClient({
  settings = {},
  featuredEvent = null,
  ongoingEvents = [],
  upcomingEvents = [],
  pastEvents = [],
}) {
  return (
    <>
      <HeroSection s={settings} />
      <SpotlightSection s={settings} event={featuredEvent} />
      <OngoingSection s={settings} events={ongoingEvents} />
      <UpcomingSection s={settings} events={upcomingEvents} />
      <PastSection s={settings} events={pastEvents} />
      <CtaSection s={settings} />
    </>
  );
}