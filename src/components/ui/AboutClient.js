'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowRight, CheckCircle2, Shield, Layers, Award,
  Lightbulb, ChevronDown, ChevronUp, Sparkles, Star,
  Globe, Users, BookOpen, Zap, Heart, Target,
  Rocket, Leaf, FlaskConical, Microscope, Map,
  TrendingUp, Compass, Flame, Crown, Diamond,
} from 'lucide-react';

// ── Helpers ───────────────────────────────────────────────────────────────────

const LUCIDE_MAP = {
  Shield, Layers, Award, Lightbulb, Sparkles, Star,
  Globe, Users, BookOpen, Zap, Heart, Target,
  Rocket, Leaf, FlaskConical, Microscope, Map,
  TrendingUp, Compass, Flame, Crown, Diamond,
};

// Map common emoji to lucide icon names for timeline fallback
const EMOJI_TO_ICON = {
  '🌱': 'Leaf',
  '🚀': 'Rocket',
  '🔬': 'Microscope',
  '🌍': 'Globe',
  '💡': 'Lightbulb',
  '⭐': 'Star',
  '❤️': 'Heart',
  '🎯': 'Target',
  '⚡': 'Zap',
  '📚': 'BookOpen',
  '👥': 'Users',
  '✨': 'Sparkles',
  '🏆': 'Award',
  '🧪': 'FlaskConical',
  '🗺️': 'Map',
  '📈': 'TrendingUp',
  '🧭': 'Compass',
  '🔥': 'Flame',
  '👑': 'Crown',
  '💎': 'Diamond',
};

function resolveIcon(iconStr, size = 18, color = 'currentColor') {
  if (!iconStr) return null;
  // If it's a known Lucide name
  if (LUCIDE_MAP[iconStr]) {
    const Comp = LUCIDE_MAP[iconStr];
    return <Comp size={size} color={color} strokeWidth={1.5} />;
  }
  // If it's an emoji, map to Lucide
  const mapped = EMOJI_TO_ICON[iconStr];
  if (mapped && LUCIDE_MAP[mapped]) {
    const Comp = LUCIDE_MAP[mapped];
    return <Comp size={size} color={color} strokeWidth={1.5} />;
  }
  // Unknown — render nothing elegant
  return <Sparkles size={size} color={color} strokeWidth={1.5} />;
}

function LucideIcon({ name, size = 22, color = 'currentColor', ...rest }) {
  const Comp = LUCIDE_MAP[name];
  if (!Comp) return <Sparkles size={size} color={color} strokeWidth={1.5} {...rest} />;
  return <Comp size={size} color={color} strokeWidth={1.5} {...rest} />;
}

function GoldDivider({ centered = false }) {
  return (
    <div
      className={centered ? 'ab-divider ab-divider--center' : 'ab-divider'}
      aria-hidden="true"
    />
  );
}

function Badge({ text, dark = false }) {
  if (!text) return null;
  return <span className={dark ? 'ab-pill ab-pill--dark' : 'ab-pill'}>{text}</span>;
}

// ── Intersection Observer hook ────────────────────────────────────────────────

function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return [ref, visible];
}

// ── 3-D tilt hook ─────────────────────────────────────────────────────────────

function useTilt() {
  const ref = useRef(null);

  const onMove = useCallback(e => {
    const el = ref.current;
    if (!el) return;
    const { left, top, width, height } = el.getBoundingClientRect();
    const x = ((e.clientX - left) / width - 0.5) * 2;
    const y = ((e.clientY - top) / height - 0.5) * 2;
    el.style.transform = `perspective(900px) rotateY(${x * 5}deg) rotateX(${-y * 4}deg) translateY(-4px)`;
  }, []);

  const onLeave = useCallback(() => {
    if (ref.current) ref.current.style.transform = '';
  }, []);

  return { ref, onMouseMove: onMove, onMouseLeave: onLeave };
}

// ── Section reveal wrapper ────────────────────────────────────────────────────

function Reveal({ children, className = '', delay = 0, dir = 'up' }) {
  const [ref, visible] = useReveal();
  const transforms = { up: 'translateY(32px)', left: 'translateX(-32px)', right: 'translateX(32px)' };
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : (transforms[dir] || transforms.up),
        transition: `opacity 0.7s ${delay}ms cubic-bezier(0.25,0.46,0.45,0.94), transform 0.7s ${delay}ms cubic-bezier(0.25,0.46,0.45,0.94)`,
      }}
    >
      {children}
    </div>
  );
}

// ── Timeline Item ─────────────────────────────────────────────────────────────

function TimelineItem({ item, index }) {
  const [expanded, setExpanded] = useState(false);
  const [ref, visible] = useReveal();
  const isLeft = index % 2 === 0;
  const hasMore = item.expanded_description && item.expanded_description.trim().length > 0;
  const dateLabel = [item.month, item.year].filter(Boolean).join(' ') || '';

  return (
    <div
      ref={ref}
      className={`ab-tl-item ${isLeft ? 'ab-tl-item--left' : 'ab-tl-item--right'}`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : (isLeft ? 'translateX(-32px)' : 'translateX(32px)'),
        transition: `opacity 0.7s ${index * 100}ms ease, transform 0.7s ${index * 100}ms ease`,
      }}
    >
      <div className="ab-tl-dot" />
      <div className={`ab-tl-card ${expanded ? 'ab-tl-card--open' : ''}`}>
        {dateLabel && <span className="ab-tl-year">{dateLabel}</span>}
        {item.icon && (
          <div className="ab-tl-icon">
            {resolveIcon(item.icon, 20, 'var(--gold)')}
          </div>
        )}
        <h3 className="ab-tl-title">{item.title}</h3>
        {item.short_description && <p className="ab-tl-short">{item.short_description}</p>}
        {hasMore && (
          <>
            <div className={`ab-tl-more ${expanded ? 'ab-tl-more--open' : ''}`}>
              <p className="ab-tl-long">{item.expanded_description}</p>
            </div>
            <button
              type="button"
              className="ab-tl-toggle"
              onClick={() => setExpanded(p => !p)}
              aria-expanded={expanded}
            >
              {expanded ? (<><ChevronUp size={14} /> Show less</>) : (<><ChevronDown size={14} /> Read more</>)}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── Value Card ────────────────────────────────────────────────────────────────

function ValueCard({ v, delay }) {
  const tilt = useTilt();
  const [ref, visible] = useReveal();

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(32px)',
        transition: `opacity 0.7s ${delay}ms ease, transform 0.7s ${delay}ms ease`,
      }}
    >
      <div
        ref={tilt.ref}
        onMouseMove={tilt.onMouseMove}
        onMouseLeave={tilt.onMouseLeave}
        className="ab-value-card"
        style={{ borderTopColor: v.color || 'var(--gold)' }}
      >
        <div className="ab-value-icon">
          {resolveIcon(v.icon, 22, 'var(--gold)')}
        </div>
        <h3 className="ab-value-name">{v.name}</h3>
        <p className="ab-value-short">{v.short_description}</p>
        {v.long_description && (
          <p className="ab-value-long">{v.long_description}</p>
        )}
      </div>
    </div>
  );
}

// ── Drive Card ────────────────────────────────────────────────────────────────

function DriveCard({ v, index, delay }) {
  const tilt = useTilt();
  const [ref, visible] = useReveal();
  const isAlt = index % 2 !== 0;

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(32px)',
        transition: `opacity 0.7s ${delay}ms ease, transform 0.7s ${delay}ms ease`,
      }}
    >
      <div
        ref={tilt.ref}
        onMouseMove={tilt.onMouseMove}
        onMouseLeave={tilt.onMouseLeave}
        className={`ab-drive-card ${isAlt ? 'ab-drive-card--alt' : ''}`}
      >
        <div className={`ab-drive-icon-box ${isAlt ? 'ab-drive-icon-box--alt' : ''}`}>
          {resolveIcon(v.icon || 'Star', 22, 'var(--gold)')}
        </div>
        <h3 className="ab-drive-name">{v.name}</h3>
        <p className="ab-drive-short">{v.short_description}</p>
      </div>
    </div>
  );
}

// ── Why Deco: Premium Icon Cluster (replaces emoji shapes) ────────────────────

function WhyDecoCluster() {
  return (
    <div className="ab-why-shapes">
      <div className="ab-why-shape ab-why-shape--1">
        <Rocket size={38} color="var(--gold)" strokeWidth={1.4} />
      </div>
      <div className="ab-why-shape ab-why-shape--2">
        <Lightbulb size={32} color="var(--gold)" strokeWidth={1.4} />
      </div>
      <div className="ab-why-shape ab-why-shape--3">
        <Globe size={34} color="var(--gold)" strokeWidth={1.4} />
      </div>
      <div className="ab-why-center">
        <Sparkles size={24} color="var(--gold)" strokeWidth={1.4} />
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AboutClient({ settings, coreValues, timeline }) {
  const s  = settings    || {};
  const cv = coreValues  || [];
  const tl = timeline    || [];

  // ── Settings ──
  const heroTitle    = s.about_hero_title      ?? 'Shaping the Next Generation of Leaders';
  const heroBadge    = s.about_hero_badge_text ?? 'OUR STORY';
  const heroSubtitle = s.about_hero_subtitle   ?? '';
  const heroContent  = s.about_hero_content    ?? 'YouthVerse Union is a South Asian youth-led organization dedicated to empowering the next generation through research, innovation, and cross-border collaboration.';
  const heroBtnText  = s.about_hero_btn_text   ?? 'Our Journey';
  const heroBtnLink  = s.about_hero_btn_link   ?? '#timeline';
  const heroBtnText2 = s.about_hero_btn2_text  ?? 'Meet the Team';
  const heroBtnLink2 = s.about_hero_btn2_link  ?? '/team';

  const storyBadge   = s.about_story_badge_text ?? 'THE BEGINNING';
  const storyTitle   = s.about_story_title      ?? 'How YouthVerse Union Came to Be';
  const storyContent = s.about_story_content    ?? 'Born from a shared passion for youth development, YouthVerse Union emerged as a response to the untapped potential of South Asian youth. We saw brilliant minds without a platform, and we decided to build one.';
  const storyQuote   = s.about_story_quote      ?? '';

  const whyBadge    = s.about_why_badge_text ?? 'OUR MOTIVATION';
  const whyTitle    = s.about_why_title      ?? 'Why We Started';
  const whyContent  = s.about_why_content    ?? 'We saw a gap — youth across South Asia had potential, ambition, and ideas, but lacked the structured environment to turn those into real-world impact. YouthVerse Union was built to bridge that gap.';
  const whyPoint1   = s.about_why_point_1    ?? 'Youth voices deserve a global platform';
  const whyPoint2   = s.about_why_point_2    ?? 'Research bridges knowledge and action';
  const whyPoint3   = s.about_why_point_3    ?? 'Collaboration accelerates real impact';

  const missionTitle   = s.mission_title   ?? 'Our Mission';
  const missionContent = s.mission_content ?? 'To empower South Asian youth through education, research, and meaningful cross-border collaboration that creates lasting change.';
  const visionTitle    = s.vision_title    ?? 'Our Vision';
  const visionContent  = s.vision_content  ?? 'A world where every young person has access to the knowledge, networks, and opportunities they need to shape a better future.';

  const philBadge   = s.about_philosophy_badge_text ?? 'OUR PHILOSOPHY';
  const philTitle   = s.about_philosophy_title      ?? 'What We Believe In';
  const philContent = s.about_philosophy_content    ?? 'We believe every young person carries within them the seeds of extraordinary change. Our role is not to direct that energy, but to cultivate the conditions in which it can flourish — through rigour, community, and relentless optimism.';

  const pillar1Icon  = s.about_pillar_1_icon  ?? 'Shield';
  const pillar1Title = s.about_pillar_1_title ?? 'Integrity First';
  const pillar1Text  = s.about_pillar_1_text  ?? 'Truth above all in everything we do.';
  const pillar2Icon  = s.about_pillar_2_icon  ?? 'Layers';
  const pillar2Title = s.about_pillar_2_title ?? 'Depth of Thought';
  const pillar2Text  = s.about_pillar_2_text  ?? 'Surface answers are never enough.';
  const pillar3Icon  = s.about_pillar_3_icon  ?? 'Award';
  const pillar3Title = s.about_pillar_3_title ?? 'Excellence Always';
  const pillar3Text  = s.about_pillar_3_text  ?? 'Every initiative, raised to the highest standard.';

  const drivesBadge = s.about_drives_badge_text ?? 'WHAT DRIVES US';
  const drivesTitle = s.about_drives_title      ?? 'The Forces Behind Our Work';
  const drivesSub   = s.about_drives_subtitle   ?? 'Core values that guide every decision we make';

  const timelineBadge = s.about_timeline_badge_text ?? 'OUR JOURNEY';
  const timelineTitle = s.about_timeline_title      ?? 'Milestones That Define Us';
  const timelineSub   = s.about_timeline_sub        ?? "Key moments in YouthVerse Union's history";

  const ctaBadge   = s.about_cta_badge_text ?? 'JOIN US';
  const ctaTitle   = s.about_cta_title      ?? 'Be Part of Our Story';
  const ctaContent = s.about_cta_content    ?? "We're always looking for passionate young people ready to make a difference. Whether you want to lead, research, or simply connect — there is a place for you here.";
  const ctaBtn1    = s.about_cta_btn_text   ?? 'Get Involved';
  const ctaLink1   = s.about_cta_btn_link   ?? '/get-involved';
  const ctaBtn2    = s.about_cta_btn2_text  ?? 'Contact Us';
  const ctaLink2   = s.about_cta_btn2_link  ?? '/contact';

  // Fallback timeline
  const tlData = tl.length > 0 ? tl : [
    { id: 1, year: '2022', month: '', icon: 'Leaf', title: 'The Idea Takes Root', short_description: 'Three students in Dhaka imagine a platform for South Asian youth.', display_order: 1 },
    { id: 2, year: '2023', month: '', icon: 'Rocket', title: 'YVU Is Founded', short_description: 'YouthVerse Union officially launches under SARULF Group.', display_order: 2 },
    { id: 3, year: '2024', month: '', icon: 'Microscope', title: 'Research Initiative Begins', short_description: 'Our first research publication reaches youth across 5 countries.', display_order: 3 },
    { id: 4, year: '2025', month: '', icon: 'Globe', title: 'Going Global', short_description: 'Members from 12+ countries join our growing movement.', display_order: 4 },
  ];

  // Decorative year stubs for story section
  const storyYears = tlData.slice(0, 3).map(t => t.year).filter(Boolean);
  if (storyYears.length < 3) {
    while (storyYears.length < 3) storyYears.push(['2022','2023','2024'][storyYears.length]);
  }

  const pillars = [
    { icon: pillar1Icon, title: pillar1Title, text: pillar1Text },
    { icon: pillar2Icon, title: pillar2Title, text: pillar2Text },
    { icon: pillar3Icon, title: pillar3Title, text: pillar3Text },
  ];

  return (
    <main>

      {/* ── SECTION 1: HERO ── */}
      <section className="ab-hero">
        <div className="ab-hero-inner">
          {/* Left: Text */}
          <div className="ab-hero-content">
            <Reveal delay={80}>
              <p className="ab-hero-kicker">South Asia&rsquo;s Premier Youth Organization</p>
            </Reveal>
            <Reveal delay={160}>
              <h1 className="ab-hero-title">{heroTitle}</h1>
            </Reveal>
            <Reveal delay={220}>
              <GoldDivider />
            </Reveal>
            {heroSubtitle && (
              <Reveal delay={280}>
                <p className="ab-hero-subtitle">{heroSubtitle}</p>
              </Reveal>
            )}
            <Reveal delay={320}>
              <p className="ab-hero-desc">{heroContent}</p>
            </Reveal>
            <Reveal delay={400}>
              <div className="ab-hero-btns">
                {heroBtnText && (
                  <a href={heroBtnLink} className="ab-btn ab-btn--primary">
                    {heroBtnText} <ArrowRight size={16} />
                  </a>
                )}
                {heroBtnText2 && (
                  <a href={heroBtnLink2} className="ab-btn ab-btn--ghost">
                    {heroBtnText2}
                  </a>
                )}
              </div>
            </Reveal>
          </div>

          {/* Right: Decorative orbital graphic */}
          <Reveal className="ab-hero-deco" delay={200} dir="right">
            <div className="ab-hero-orb-wrap">
              <div className="ab-hero-orb ab-hero-orb--ring1" />
              <div className="ab-hero-orb ab-hero-orb--ring2" />
              <div className="ab-hero-orb ab-hero-orb--ring3" />
              <div className="ab-hero-orb-core">
                <Globe size={36} color="var(--gold)" strokeWidth={1.2} />
              </div>
              <div className="ab-hero-orb-dot ab-hero-orb-dot--1"><Users size={14} color="var(--gold)" strokeWidth={1.5} /></div>
              <div className="ab-hero-orb-dot ab-hero-orb-dot--2"><BookOpen size={14} color="var(--gold)" strokeWidth={1.5} /></div>
              <div className="ab-hero-orb-dot ab-hero-orb-dot--3"><Sparkles size={14} color="var(--gold)" strokeWidth={1.5} /></div>
              <div className="ab-hero-orb-dot ab-hero-orb-dot--4"><Zap size={14} color="var(--gold)" strokeWidth={1.5} /></div>
            </div>
          </Reveal>
        </div>
        {/* Gradient fade into next section */}
        <div className="ab-hero-fade" />
      </section>

      {/* ── SECTION 2: OUR STORY ── */}
      <section className="ab-story">
        <div className="ab-story-inner">
          {/* Text side */}
          <Reveal className="ab-story-text" delay={0} dir="left">
            <Badge text={storyBadge} />
            <h2 className="ab-story-title">{storyTitle}</h2>
            <GoldDivider />
            <p className="ab-story-body">{storyContent}</p>
            {storyQuote && (
              <blockquote className="ab-story-quote">
                <p>{storyQuote}</p>
              </blockquote>
            )}
          </Reveal>

          {/* Decorative year stub */}
          <Reveal className="ab-story-deco" delay={200} dir="right">
            <div className="ab-story-spine">
              <div className="ab-story-spine-line" />
              {storyYears.map((yr, i) => (
                <div key={yr + i} className="ab-story-milestone" style={{ top: `${i * 40}%` }}>
                  <div className="ab-story-dot" />
                  <span className="ab-story-yr">{yr}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── SECTION 3: WHY WE STARTED ── */}
      <section className="ab-why">
        <div className="ab-why-inner">
          {/* Premium icon cluster (replaces colorful emoji boxes) */}
          <Reveal className="ab-why-deco" delay={0} dir="left">
            <WhyDecoCluster />
          </Reveal>

          {/* Text */}
          <Reveal className="ab-why-text" delay={150} dir="right">
            <Badge text={whyBadge} />
            <h2 className="ab-why-title">{whyTitle}</h2>
            <GoldDivider />
            <p className="ab-why-body">{whyContent}</p>
            <ul className="ab-why-points">
              {[whyPoint1, whyPoint2, whyPoint3].map((pt, i) => (
                <li key={i} className="ab-why-point">
                  <CheckCircle2 size={18} color="var(--gold)" strokeWidth={1.5} />
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* ── SECTION 4: MISSION & VISION ── */}
      <section className="ab-mv">
        <Reveal delay={0}>
          <div className="ab-mv-grid">
            <div className="ab-mv-card ab-mv-card--light">
              <div className="ab-mv-icon-wrap">
                <Target size={28} color="var(--gold)" strokeWidth={1.5} />
              </div>
              <h3 className="ab-mv-title">{missionTitle}</h3>
              <GoldDivider />
              <p className="ab-mv-body">{missionContent}</p>
            </div>
            <div className="ab-mv-card ab-mv-card--dark">
              <div className="ab-mv-icon-wrap ab-mv-icon-wrap--dark">
                <Globe size={28} color="var(--gold)" strokeWidth={1.5} />
              </div>
              <h3 className="ab-mv-title ab-mv-title--light">{visionTitle}</h3>
              <GoldDivider />
              <p className="ab-mv-body ab-mv-body--light">{visionContent}</p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── SECTION 5: PHILOSOPHY ── */}
      <section className="ab-philosophy">
        <Reveal delay={0}>
          <Badge text={philBadge} dark />
        </Reveal>
        <Reveal delay={100}>
          <h2 className="ab-phil-title">{philTitle}</h2>
        </Reveal>
        <Reveal delay={160}>
          <GoldDivider centered />
        </Reveal>
        <Reveal delay={220}>
          <p className="ab-phil-quote">{philContent}</p>
        </Reveal>
        <div className="ab-phil-pillars">
          {pillars.map((p, i) => (
            <Reveal key={i} delay={i * 100} className="ab-phil-pillar">
              <div className="ab-phil-pillar-icon">
                <LucideIcon name={p.icon} size={24} color="var(--gold)" strokeWidth={1.5} />
              </div>
              <h3 className="ab-phil-pillar-title">{p.title}</h3>
              <p className="ab-phil-pillar-text">{p.text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── SECTION 6: WHAT DRIVES US ── */}
      {cv.length > 0 && (
        <section className="ab-drives">
          <Reveal delay={0}>
            <Badge text={drivesBadge} />
            <h2 className="ab-drives-title">{drivesTitle}</h2>
            {drivesSub && <p className="ab-drives-sub">{drivesSub}</p>}
            <GoldDivider centered />
          </Reveal>
          <div className="ab-drives-grid">
            {cv.map((v, i) => (
              <DriveCard key={v.id} v={v} index={i} delay={i * 80} />
            ))}
          </div>
        </section>
      )}

      {/* Section 7 (duplicate Core Values) intentionally removed */}

      {/* ── SECTION 8: TIMELINE ── */}
      <section className="ab-timeline" id="timeline">
        <Reveal delay={0}>
          <Badge text={timelineBadge} dark />
          <h2 className="ab-tl-heading">{timelineTitle}</h2>
          {timelineSub && <p className="ab-tl-sub">{timelineSub}</p>}
          <GoldDivider centered />
        </Reveal>

        <div className="ab-tl-spine">
          <div className="ab-tl-center-line" aria-hidden="true" />
          {tlData.map((item, i) => (
            <TimelineItem key={item.id} item={item} index={i} />
          ))}
        </div>
      </section>

      {/* ── SECTION 9: CTA ── */}
      <section className="ab-cta">
        <Reveal delay={0}>
          <Badge text={ctaBadge} />
          <h2 className="ab-cta-title">{ctaTitle}</h2>
          <GoldDivider centered />
          {ctaContent && <p className="ab-cta-body">{ctaContent}</p>}
          <div className="ab-cta-btns">
            {ctaBtn1 && (
              <a href={ctaLink1} className="ab-btn ab-btn--primary">
                {ctaBtn1} <ArrowRight size={16} />
              </a>
            )}
            {ctaBtn2 && (
              <a href={ctaLink2} className="ab-btn ab-btn--ghost ab-btn--ghost-light">
                {ctaBtn2}
              </a>
            )}
          </div>
        </Reveal>
      </section>

    </main>
  );
}