'use client';

import { useEffect, useRef, useCallback } from 'react';
import {
  ArrowRight, Calendar, BookOpen, Users, Globe, Globe2,
  Lightbulb, Rocket, Heart, Target, Compass, Trophy,
  MapPin, Star, Zap, Shield, Award, TrendingUp,
  BarChart2, Activity, Layers, Cpu, Eye, Feather,
  CheckCircle, Briefcase, Code, Leaf, Sun, Moon,
  Music, Camera, Film, Coffee, Gift, Anchor,
} from 'lucide-react';

/* ── Icon resolver ─────────────────────────────────────────── */
const ICON_MAP = {
  Calendar, BookOpen, Users, Globe, Globe2,
  Lightbulb, Rocket, Heart, Target, Compass, Trophy,
  MapPin, Star, Zap, Shield, Award, TrendingUp,
  BarChart2, Activity, Layers, Cpu, Eye, Feather,
  CheckCircle, Briefcase, Code, Leaf, Sun, Moon,
  Music, Camera, Film, Coffee, Gift, Anchor,
};

function LucideIcon({ name, size = 24, color }) {
  const Comp = ICON_MAP[name];
  if (!Comp) return null;
  return <Comp size={size} color={color} />;
}

function isEmoji(str) {
  return /\p{Emoji}/u.test(str) && !/^[a-zA-Z]/.test(str);
}

/* ── Stat counter hook ─────────────────────────────────────── */
function useCounterAnimation(ref, target, duration = 1600) {
  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    let startTime = null;
    const num = parseFloat(target.replace(/[^0-9.]/g, '')) || 0;
    const suffix = target.replace(/[0-9.]/g, '');
    const isFloat = target.includes('.');
    const decimals = isFloat ? (target.split('.')[1] || '').replace(/[^0-9]/g, '').length : 0;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * num;
      el.textContent = (isFloat ? current.toFixed(decimals) : Math.floor(current)) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    el.textContent = '0' + suffix;
    requestAnimationFrame(step);
  }, [target, duration]);
}

/* ── Stat Card ─────────────────────────────────────────────── */
function StatCard({ stat, index }) {
  const numRef = useRef(null);
  const cardRef = useRef(null);
  const animated = useRef(false);

  const displayValue = stat.value + (stat.suffix || '');

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animated.current) {
          animated.current = true;
          // Trigger counter
          const numEl = numRef.current;
          if (!numEl) return;
          const target = displayValue;
          const num = parseFloat(target.replace(/[^0-9.]/g, '')) || 0;
          const suffix = target.replace(/[0-9.]/g, '');
          let startTime = null;
          function step(ts) {
            if (!startTime) startTime = ts;
            const progress = Math.min((ts - startTime) / 1600, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            numEl.textContent = Math.floor(eased * num) + suffix;
            if (progress < 1) requestAnimationFrame(step);
          }
          numEl.textContent = '0' + suffix;
          requestAnimationFrame(step);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [displayValue]);

  const handleMouseMove = useCallback((e) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    el.style.transform = `translateY(-6px) perspective(900px) rotateY(${x * 5}deg) rotateX(${-y * 4}deg)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    const el = cardRef.current;
    if (el) el.style.transform = '';
  }, []);

  return (
    <div
      ref={cardRef}
      className="hv-stat-card hv-reveal"
      style={{ transitionDelay: `${index * 100}ms` }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="hv-stat-icon">
        <LucideIcon name={stat.icon} size={24} />
      </div>
      <div ref={numRef} className="hv-stat-num">{displayValue}</div>
      <div className="hv-stat-lbl">{stat.label}</div>
    </div>
  );
}

/* ── Drive Card ────────────────────────────────────────────── */
function DriveCard({ drive, index }) {
  const cardRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    el.style.transform = `translateY(-8px) perspective(900px) rotateY(${x * 5}deg) rotateX(${-y * 4}deg)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    const el = cardRef.current;
    if (el) el.style.transform = '';
  }, []);

  const iconClass = index % 2 === 0 ? 'hv-drives-icon hv-icon-gold' : 'hv-drives-icon hv-icon-navy';
  const iconColor = index % 2 === 0 ? 'var(--gold)' : 'var(--beige)';

  return (
    <div
      ref={cardRef}
      className="hv-drives-card hv-reveal"
      style={{ transitionDelay: `${index * 100}ms` }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className={iconClass}>
        <LucideIcon name={drive.icon} size={26} color={iconColor} />
      </div>
      <h3>{drive.title}</h3>
      <p>{drive.text}</p>
    </div>
  );
}

/* ── Value Card ────────────────────────────────────────────── */
function ValueCard({ value, index }) {
  const cardRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    el.style.transform = `translateY(-8px) perspective(900px) rotateY(${x * 5}deg) rotateX(${-y * 4}deg)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    const el = cardRef.current;
    if (el) el.style.transform = '';
  }, []);

  // Resolve icon: prefer Lucide name, fall back to Star for emojis/unknowns
  const resolvedIcon = (!value.icon || isEmoji(value.icon || '') || !ICON_MAP[value.icon])
    ? 'Star'
    : value.icon;

  return (
    <div
      ref={cardRef}
      className="hv-value-card hv-reveal"
      style={{ transitionDelay: `${index * 80}ms` }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="hv-value-icon">
        <LucideIcon name={resolvedIcon} size={26} color="var(--gold)" />
      </div>
      <h4>{value.name}</h4>
      <p>{value.short_description}</p>
    </div>
  );
}

/* ── Main Component ────────────────────────────────────────── */
export default function HomeClient({ settings, statItems, coreValues, upcomingEvents }) {
  const s = settings || {};
  const heroGraphicRef = useRef(null);

  /* ── Scroll reveal observer ── */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('hv-visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('.hv-reveal, .hv-reveal-scale').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  /* ── Hero parallax ── */
  useEffect(() => {
    const graphic = heroGraphicRef.current;
    if (!graphic) return;
    function handleMouseMove(e) {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const dx = (e.clientX - cx) / cx;
      const dy = (e.clientY - cy) / cy;
      graphic.style.transform = `translateX(${dx * 8}px) translateY(${dy * 5}px)`;
    }
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  /* ── Data preparation ── */
  const fallbackStats = [
    { label: 'Events Hosted',    value: '12', suffix: '+', icon: 'Calendar' },
    { label: 'Research Papers',  value: '8',  suffix: '+', icon: 'BookOpen' },
    { label: 'Team Members',     value: '30', suffix: '+', icon: 'Users'    },
    { label: 'Countries Reached',value: '12', suffix: '+', icon: 'Globe'    },
  ];
  const stats = (statItems && statItems.length > 0) ? statItems : fallbackStats;

  const fallbackDrives = [
    { icon: 'Lightbulb', title: 'Knowledge & Innovation', text: 'We believe in learning that never stops and ideas that reshape the world.' },
    { icon: 'Globe2',    title: 'Global Collaboration',   text: 'Youth across South Asia and beyond, connected by shared purpose.' },
    { icon: 'Rocket',    title: 'Youth Empowerment',      text: 'Giving young people the tools, platform, and confidence to lead.' },
    { icon: 'Heart',     title: 'Community First',        text: 'Every initiative we run puts our community at the heart of it all.' },
  ];
  const drives = [0, 1, 2, 3].map(i => ({
    icon:  s[`home_drive_${i+1}_icon`]  || fallbackDrives[i].icon,
    title: s[`home_drive_${i+1}_title`] || fallbackDrives[i].title,
    text:  s[`home_drive_${i+1}_text`]  || fallbackDrives[i].text,
  }));

  const fallbackValues = [
    { id: 'rv1', icon: 'BookOpen',    name: 'Research-Driven',  short_description: 'Evidence-based decisions'     },
    { id: 'rv2', icon: 'Globe',       name: 'Global Mindset',   short_description: 'Borderless collaboration'     },
    { id: 'rv3', icon: 'Shield',      name: 'Integrity',        short_description: 'Leading with honesty'         },
    { id: 'rv4', icon: 'Zap',         name: 'Innovation',       short_description: "Creating what doesn't exist" },
    { id: 'rv5', icon: 'Award',       name: 'Excellence',       short_description: 'Raising the bar always'      },
  ];
  const values = coreValues && coreValues.length > 0 ? coreValues : fallbackValues;

  const founderMessage = s.founder_message;
  const founderName    = s.founder_name  ?? 'Alnaf Sajim';
  const founderTitle   = s.founder_title ?? 'Founder & President, YouthVerse Union';
  const founderPhoto   = s.founder_photo;
  const founderInitials = founderName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const featuredEvent = upcomingEvents && upcomingEvents.length > 0 ? upcomingEvents[0] : null;
  const extraEventCount = upcomingEvents && upcomingEvents.length > 1 ? upcomingEvents.length - 1 : 0;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch { return dateStr; }
  };

  return (
    <main>

      {/* ══════════════════════════════════════════════════════
          SECTION 1 — HERO
      ══════════════════════════════════════════════════════ */}
      <section className="hv-hero">
        {/* Overlay */}
        <div className="hv-hero-overlay" />

        {/* Watermark */}
        <div className="hv-watermark" aria-hidden="true">
          {'YOUTHVERSE UNION · YOUTHVERSE UNION · '.repeat(4)}
        </div>

        {/* Gold particles */}
        <div className="hv-particles" aria-hidden="true">
          <div className="hv-particle" style={{ left: '15%', top: '30%', animationDelay: '0s',   animationDuration: '6s'  }} />
          <div className="hv-particle" style={{ left: '75%', top: '60%', animationDelay: '1.5s', animationDuration: '7s'  }} />
          <div className="hv-particle" style={{ left: '40%', top: '70%', animationDelay: '3s',   animationDuration: '5s'  }} />
          <div className="hv-particle" style={{ left: '88%', top: '25%', animationDelay: '0.8s', animationDuration: '8s'  }} />
          <div className="hv-particle" style={{ left: '55%', top: '45%', animationDelay: '2.2s', animationDuration: '6.5s'}} />
        </div>

        {/* Inner */}
        <div className="hv-hero-inner">
          {/* Left */}
          <div className="hv-hero-left">
            <h1 className="hv-hero-title">
              <span className="hv-title-white">{s.home_hero_title ?? 'Inspiring Minds'}</span>
              <span className="hv-title-gold">{s.home_hero_subtitle ?? 'Beyond Boundaries'}</span>
            </h1>

            <div className="hv-hero-sub">
              {s.home_hero_text ?? "South Asia's Premier Youth Organization"}
            </div>

            <p className="hv-hero-desc">
              {s.home_hero_content ?? 'We unite young minds across South Asia through research, innovation, and meaningful collaboration — building the next generation of leaders.'}
            </p>

            <div className="hv-hero-btns">
              <a href={s.home_hero_btn_link ?? '/events'} className="hv-btn-primary">
                {s.home_hero_btn_text ?? 'Explore Our Work'}
                <span className="hv-arrow"><ArrowRight size={16} /></span>
              </a>
              <a href={s.home_hero_btn2_link ?? '/get-involved'} className="hv-btn-ghost">
                {s.home_hero_btn2_text ?? 'Get Involved'}
              </a>
            </div>
          </div>

          {/* Right — Hero graphic */}
          <div className="hv-hero-right">
            <div className="hv-hero-graphic" ref={heroGraphicRef}>
              <div className="hv-orb hv-orb1" />
              <div className="hv-orb hv-orb2" />
              <div className="hv-orb hv-orb3" />

              {/* Orbiting dot */}
              <div className="hv-orbit-dot" aria-hidden="true" />

              {/* Globe / orbit SVG */}
              <svg
                className="hv-hero-svg"
                viewBox="0 0 380 380"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Outer ring */}
                <circle cx="190" cy="190" r="170" stroke="rgba(200,167,94,0.18)" strokeWidth="1" />
                {/* Globe body */}
                <circle cx="190" cy="190" r="120" stroke="rgba(200,167,94,0.25)" strokeWidth="1.5" fill="rgba(19,28,48,0.6)" />
                {/* Latitude lines */}
                <ellipse cx="190" cy="190" rx="120" ry="45" stroke="rgba(200,167,94,0.14)" strokeWidth="1" />
                <ellipse cx="190" cy="190" rx="120" ry="82" stroke="rgba(200,167,94,0.10)" strokeWidth="1" />
                {/* Longitude lines */}
                <ellipse cx="190" cy="190" rx="45" ry="120" stroke="rgba(200,167,94,0.14)" strokeWidth="1" />
                <ellipse cx="190" cy="190" rx="82" ry="120" stroke="rgba(200,167,94,0.10)" strokeWidth="1" />
                {/* Equator */}
                <line x1="70" y1="190" x2="310" y2="190" stroke="rgba(200,167,94,0.2)" strokeWidth="1" />
                {/* Vertical axis */}
                <line x1="190" y1="70" x2="190" y2="310" stroke="rgba(200,167,94,0.2)" strokeWidth="1" />
                {/* Pole caps glow */}
                <circle cx="190" cy="75"  r="6" fill="rgba(200,167,94,0.4)" />
                <circle cx="190" cy="305" r="6" fill="rgba(200,167,94,0.3)" />
                {/* Orbital ring (tilted) */}
                <ellipse cx="190" cy="190" rx="160" ry="50" stroke="rgba(200,167,94,0.22)" strokeWidth="1.2" transform="rotate(-25 190 190)" strokeDasharray="6 4" />
                {/* Gold dot nodes */}
                <circle cx="130" cy="145" r="3.5" fill="rgba(200,167,94,0.7)" />
                <circle cx="255" cy="160" r="3"   fill="rgba(200,167,94,0.6)" />
                <circle cx="190" cy="255" r="4"   fill="rgba(200,167,94,0.8)" />
                <circle cx="150" cy="225" r="2.5" fill="rgba(200,167,94,0.5)" />
                <circle cx="235" cy="220" r="2.5" fill="rgba(200,167,94,0.5)" />
                {/* Connection lines */}
                <line x1="130" y1="145" x2="255" y2="160" stroke="rgba(200,167,94,0.18)" strokeWidth="1" />
                <line x1="255" y1="160" x2="190" y2="255" stroke="rgba(200,167,94,0.18)" strokeWidth="1" />
                <line x1="190" y1="255" x2="130" y2="145" stroke="rgba(200,167,94,0.12)" strokeWidth="1" />
                {/* Center glow */}
                <circle cx="190" cy="190" r="22" fill="rgba(200,167,94,0.08)" />
                <circle cx="190" cy="190" r="10" fill="rgba(200,167,94,0.25)" />
                <circle cx="190" cy="190" r="4"  fill="rgba(200,167,94,0.9)" />
                {/* Corner rings */}
                <circle cx="45"  cy="45"  r="18" stroke="rgba(200,167,94,0.12)" strokeWidth="1" fill="none" />
                <circle cx="335" cy="335" r="18" stroke="rgba(200,167,94,0.12)" strokeWidth="1" fill="none" />
                <circle cx="335" cy="45"  r="10" stroke="rgba(200,167,94,0.08)" strokeWidth="1" fill="none" />
                <circle cx="45"  cy="335" r="10" stroke="rgba(200,167,94,0.08)" strokeWidth="1" fill="none" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 2 — IMPACT STATISTICS
      ══════════════════════════════════════════════════════ */}
      <section className="hv-stats-section">
        <div className="hv-stats-bg" aria-hidden="true" />
        <div className="hv-stats-grid">
          {stats.map((stat, i) => (
            <StatCard key={stat.label || i} stat={stat} index={i} />
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 3 — FOUNDER'S MESSAGE
      ══════════════════════════════════════════════════════ */}
      {founderMessage && (
        <section className="hv-founder-section">
          <div className="hv-reveal">
            <span className="hv-section-pill">FOUNDER'S MESSAGE</span>
          </div>

          <div className="hv-founder-card hv-reveal" style={{ transitionDelay: '100ms' }}>
            {/* Decorative quote mark */}
            <div className="hv-quote-deco" aria-hidden="true">&ldquo;</div>

            {/* Avatar */}
            <div className="hv-founder-avatar">
              {founderPhoto
                ? <img
                    src={founderPhoto}
                    alt={founderName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px' }}
                  />
                : founderInitials
              }
            </div>

            {/* Text */}
            <div className="hv-founder-body">
              <p className="hv-quote-text">{founderMessage}</p>
              <div className="hv-founder-name">{founderName}</div>
              <div className="hv-founder-role">{founderTitle}</div>
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════
          SECTION 4 — WHAT DRIVES US
      ══════════════════════════════════════════════════════ */}
      <section className="hv-drives-section">
        <div className="hv-reveal">
          <span className="hv-section-pill">WHAT DRIVES US</span>
          <h2 className="hv-section-title">{s.home_drives_title ?? 'What Drives YouthVerse Union'}</h2>
          <p className="hv-section-sub">{s.home_drives_subtitle ?? 'Fueled by passion, guided by purpose.'}</p>
        </div>

        <div className="hv-drives-grid">
          {drives.map((drive, i) => (
            <DriveCard key={i} drive={drive} index={i} />
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 5 — MISSION & VISION
      ══════════════════════════════════════════════════════ */}
      <section className="hv-mv-section">
        <div className="hv-reveal" style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span className="hv-section-pill hv-pill-light">OUR PURPOSE</span>
          <h2 className="hv-section-title" style={{ color: 'var(--beige)' }}>
            {s.home_mv_title ?? 'Mission & Vision'}
          </h2>
        </div>

        <div className="hv-mv-grid">
          {/* Mission */}
          <div className="hv-mission-card hv-reveal" style={{ transitionDelay: '0ms' }}>
            <div className="hv-mv-accent" />
            <div className="hv-mv-icon-wrap">
              <Target size={32} color="var(--gold)" />
            </div>
            <span className="hv-pill-badge">MISSION</span>
            <h3 className="hv-mv-card-title">{s.mission_title ?? 'Our Mission'}</h3>
            <p className="hv-mv-card-text">
              {s.mission_content ?? 'To empower South Asian youth through research, innovation, and collaboration — building the next generation of impactful leaders.'}
            </p>
          </div>

          {/* Vision */}
          <div className="hv-vision-card hv-reveal" style={{ transitionDelay: '150ms' }}>
            <div className="hv-mv-accent-side" />
            <div className="hv-mv-icon-wrap hv-mv-icon-dark">
              <Compass size={32} color="var(--gold)" />
            </div>
            <span className="hv-pill-badge hv-pill-badge-dark">VISION</span>
            <h3 className="hv-mv-card-title" style={{ color: 'var(--beige)' }}>{s.vision_title ?? 'Our Vision'}</h3>
            <p className="hv-mv-card-text" style={{ color: 'rgba(232,220,200,0.7)' }}>
              {s.vision_content ?? 'A world where youth voices shape decisions, drive innovation, and lead with integrity across South Asia and beyond.'}
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 6 — CORE VALUES
      ══════════════════════════════════════════════════════ */}
      <section className="hv-values-section">
        <div className="hv-reveal">
          <span className="hv-section-pill">CORE VALUES</span>
          <h2 className="hv-section-title" style={{ color: 'var(--beige)' }}>
            {s.home_values_title ?? 'What We Stand For'}
          </h2>
          <p className="hv-section-sub">
            {s.home_values_subtitle ?? 'Principles that guide every decision we make.'}
          </p>
        </div>

        <div className="hv-values-grid">
          {values.map((v, i) => (
            <ValueCard key={v.id || i} value={v} index={i} />
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 7 — UPCOMING EVENT PREVIEW
      ══════════════════════════════════════════════════════ */}
      {featuredEvent && (
        <section className="hv-event-section">
          <div className="hv-reveal">
            <div className="hv-live-badge-wrap">
              <span className="hv-live-badge">● UPCOMING</span>
            </div>
            <span className="hv-section-pill" style={{ marginLeft: '0.75rem' }}>EVENTS</span>
            <h2 className="hv-section-title">{s.home_events_title ?? "What's Happening Now"}</h2>
            <p className="hv-section-sub">
              {s.home_events_subtitle ?? 'Stay up to date with our latest events and programs.'}
            </p>
          </div>

          <div className="hv-event-card hv-reveal" style={{ transitionDelay: '100ms' }}>
            {/* Left panel */}
            <div className="hv-event-left">
              <span className="hv-live-badge">● UPCOMING</span>
              <div className="hv-event-trophy">
                <Trophy size={48} color="var(--gold)" />
              </div>
              <div className="hv-event-name">{featuredEvent.title}</div>
              {featuredEvent.event_type && (
                <span className="hv-event-type-badge">{featuredEvent.event_type}</span>
              )}
            </div>

            {/* Right panel */}
            <div className="hv-event-right">
              <div className="hv-event-meta-row">
                <span className="hv-event-meta-pill">
                  <Calendar size={13} />
                  {featuredEvent.display_date || formatDate(featuredEvent.event_date)}
                </span>
                {featuredEvent.location && (
                  <span className="hv-event-meta-pill">
                    <MapPin size={13} />
                    {featuredEvent.location}
                  </span>
                )}
              </div>

              {featuredEvent.short_description && (
                <p className="hv-event-desc">{featuredEvent.short_description}</p>
              )}

              <div className="hv-event-btns">
                <a href="/events" className="hv-btn-primary">
                  View Event Details
                  <span className="hv-arrow"><ArrowRight size={15} /></span>
                </a>
              </div>

              {extraEventCount > 0 && (
                <p style={{ marginTop: '1rem', fontSize: '0.87rem', color: 'var(--text-muted)', fontWeight: 300 }}>
                  And{' '}
                  <a href="/events" style={{ color: 'var(--gold)', fontWeight: 600, textDecoration: 'none' }}>
                    {extraEventCount} more upcoming event{extraEventCount !== 1 ? 's' : ''} →
                  </a>
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════
          SECTION 8 — CTA
      ══════════════════════════════════════════════════════ */}
      <section className="hv-cta-section">
        <div className="hv-cta-bg" aria-hidden="true" />
        <div className="hv-cta-content">
          <div className="hv-reveal">
            <span className="hv-section-pill hv-pill-light">
              {s.home_cta_badge_text ?? 'JOIN THE MOVEMENT'}
            </span>
            <h2 className="hv-cta-title">
              {s.home_cta_title ?? 'Ready to Make a Difference?'}
            </h2>
            <p className="hv-cta-sub">
              {s.home_cta_content ?? 'Join thousands of young leaders building a better tomorrow. Your voice matters — come be part of the story.'}
            </p>
          </div>

          <div className="hv-cta-btns hv-reveal" style={{ transitionDelay: '100ms' }}>
            <a href={s.home_cta_btn_link ?? '/get-involved'} className="hv-btn-primary">
              {s.home_cta_btn_text ?? 'Join Us Today'}
              <span className="hv-arrow"><ArrowRight size={16} /></span>
            </a>
            <a href={s.home_cta_btn2_link ?? '/about'} className="hv-btn-ghost-white">
              {s.home_cta_btn2_text ?? 'Learn More'}
            </a>
          </div>
        </div>
      </section>

    </main>
  );
}