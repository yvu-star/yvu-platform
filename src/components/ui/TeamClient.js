'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import {
  Globe2,
  Users2,
  Globe,
  ExternalLink,
  X,
} from 'lucide-react';

/* Brand icons removed from lucide-react@0.383.0 — inline SVG fallbacks */
function LinkedinIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function FacebookIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function InstagramIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function GlobeIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

/* ─── Helpers ─────────────────────────────────────────────── */
function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const SUPABASE_HOST = 'fsnrnrowvtukaxdfrehq.supabase.co';

function isSupabaseUrl(url) {
  return url && url.includes(SUPABASE_HOST);
}

/* ─── Member photo (smart next/image vs img) ──────────────── */
function MemberPhoto({ member, width, height, className }) {
  if (!member.image_url) {
    return (
      <div className="tm-initials-avatar" style={{ width, height }}>
        {getInitials(member.name)}
      </div>
    );
  }
  if (isSupabaseUrl(member.image_url)) {
    return (
      <Image
        src={member.image_url}
        alt={member.name}
        width={width}
        height={height}
        className={className}
        style={{ objectFit: 'cover', borderRadius: 'inherit' }}
      />
    );
  }
  /* eslint-disable-next-line @next/next/no-img-element */
  return (
    <img
      src={member.image_url}
      alt={member.name}
      width={width}
      height={height}
      className={className}
      style={{ objectFit: 'cover', borderRadius: 'inherit' }}
    />
  );
}

/* ─── Card 3-D tilt ───────────────────────────────────────── */
function useCardTilt(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function onMove(e) {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.transform = `perspective(900px) rotateY(${x * 5}deg) rotateX(${-y * 4}deg) translateY(-8px)`;
    }
    function onLeave() {
      el.style.transform = '';
    }

    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, [ref]);
}

/* ─── Member Card — portrait style (image 3) ─────────────── */
function MemberCard({ member, index, visible, onSelect }) {
  const cardRef = useRef(null);
  useCardTilt(cardRef);

  return (
    <div
      ref={cardRef}
      className={'tm-card' + (visible ? ' tm-card-visible' : '')}
      style={{ '--stagger': `${index * 60}ms` }}
      onClick={() => onSelect(member)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(member)}
      aria-label={`View profile of ${member.name}`}
    >
      {/* Full-bleed photo */}
      <div className="tm-card-img-wrap">
        <MemberPhoto member={member} width={400} height={500} className="tm-card-img" />
      </div>

      {/* White pill label at bottom */}
      <div className="tm-card-label">
        <div className="tm-card-role">{member.role || '\u00A0'}</div>
        <div className="tm-card-name">{member.name}</div>
      </div>

      {/* These are kept for CSS compat but hidden via CSS */}
      {member.country && <div className="tm-card-country">{member.country}</div>}
      <div className="tm-card-link">View profile →</div>
    </div>
  );
}

/* ─── Team Section ────────────────────────────────────────── */
function TeamSection({ members, title, subtitle, icon, altBg, startIndex, visibleSet, cardRefs, refOffset, onSelect }) {
  if (!members || members.length === 0) return null;

  return (
    <section className={'tm-section' + (altBg ? ' tm-section-alt' : '')}>
      <div className="tm-container">
        <div className="tm-section-header">
          <div className="tm-section-overline">
            {altBg ? 'Global Operations' : 'Leadership'}
          </div>
          <div className={'tm-section-icon' + (altBg ? ' tm-section-icon-gold' : '')}>
            {icon}
          </div>
          <h2 className="tm-section-title">{title}</h2>
          <p className="tm-section-sub">{subtitle}</p>
        </div>

        <div className="tm-grid">
          {members.map((member, i) => {
            const refIdx = refOffset + i;
            return (
              <div
                key={member.id}
                ref={(el) => { cardRefs.current[refIdx] = el; }}
              >
                <MemberCard
                  member={member}
                  index={startIndex + i}
                  visible={visibleSet.has(refIdx)}
                  onSelect={onSelect}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── Profile Modal — redesigned editorial style ──────────── */
function ProfileModal({ member, onClose }) {
  const isOpen = !!member;

  useEffect(() => {
    if (!isOpen) return;
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  /* Build social links — same data bindings, new inline SVGs */
  const socialLinks = member
    ? [
        member.instagram_url && {
          href: member.instagram_url,
          label: 'Instagram',
          icon: (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <rect x="2" y="2" width="20" height="20" rx="5"/>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
            </svg>
          ),
        },
        member.facebook_url && {
          href: member.facebook_url,
          label: 'Facebook',
          icon: (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
            </svg>
          ),
        },
        member.linkedin_url && {
          href: member.linkedin_url,
          label: 'LinkedIn',
          icon: (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/>
              <circle cx="4" cy="4" r="2"/>
            </svg>
          ),
        },
        member.portfolio_url && {
          href: member.portfolio_url,
          label: 'Portfolio',
          icon: (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
          ),
        },
      ].filter(Boolean)
    : [];

  /* Split name for bold first / light rest */
  const nameParts = member ? member.name.trim().split(' ') : [];
  const firstName = nameParts[0] || '';
  const restName  = nameParts.slice(1).join(' ');

  return (
    <div
      id="tmModalOverlay"
      className={'tm-modal-overlay' + (isOpen ? ' open' : '')}
      onClick={(e) => { if (e.target.id === 'tmModalOverlay') onClose(); }}
      aria-modal="true"
      role="dialog"
    >
      {member && (
        <div className="tm-modal">

          {/* Close */}
          <button className="tm-modal-close" onClick={onClose} aria-label="Close profile">
            <X size={14} />
          </button>

          {/* ── Portrait photo — left panel ── */}
          <div className="tm-modal-photo">
            {member.image_url
              ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={member.image_url}
                  alt={member.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', display: 'block' }}
                />
              )
              : (
                <div className="tm-modal-initials">
                  {getInitials(member.name)}
                </div>
              )
            }
          </div>

          {/* ── Content column ── */}
          <div className="tm-modal-content">

            {/* 1. Name */}
            <div className="tm-modal-name-wrap">
              <h3 className="tm-modal-name">
                <span style={{ fontWeight: 900 }}>{firstName}</span>
                {restName && <> <span style={{ fontWeight: 400 }}>{restName}</span></>}
              </h3>
            </div>

            {/* 2. Designation */}
            <div className="tm-modal-role-wrap">
              <div className="tm-modal-role">
                <span className="tm-modal-name-dot" />
                {member.role || 'Team Member'}
              </div>
              {member.country && (
                <div className="tm-modal-country">{member.country}</div>
              )}
            </div>

            {/* 3. Bio */}
            <div className="tm-modal-body">
              <p className="tm-modal-bio">
                {member.bio || 'Passionate team member contributing to YouthVerse Union\'s mission across South Asia.'}
              </p>
            </div>

            {/* 4. Email section */}
            <div className="tm-modal-email-section" />

            {/* 5. Social + email as icon-only buttons */}
            <div className="tm-modal-social-grid">
              {/* Email icon first */}
              <a
                href={member.email ? `mailto:${member.email}` : undefined}
                className="tm-modal-email-icon-btn"
                aria-label={member.email ? `Email ${member.name}` : 'No email available'}
                title={member.email || 'No email available'}
                style={!member.email ? { pointerEvents: 'none', opacity: 0.4 } : {}}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <path d="M2 7l10 7 10-7"/>
                </svg>
              </a>
              {/* Social icons */}
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="tm-modal-social-item"
                  aria-label={link.label}
                  title={link.label}
                >
                  {link.icon}
                </a>
              ))}
              {socialLinks.length === 0 && !member.email && (
                <span className="tm-modal-social-no-links">No contact info</span>
              )}
            </div>

          </div>{/* /tm-modal-content */}

          {/* Keep old classes in DOM (hidden via CSS) so nothing crashes */}
          <div className="tm-modal-connect-label" />
          <div className="tm-modal-links" />
        </div>
      )}
    </div>
  );
}

/* ─── Main Export ─────────────────────────────────────────── */
export default function TeamClient({
  foundingTeam = [],
  opsTeam = [],
  ctaTitle,
  heroTitle,
  heroContent,
  heroKicker,
}) {
  const [visibleSet, setVisibleSet] = useState(new Set());
  const [selectedMember, setSelectedMember] = useState(null);
  const cardRefs = useRef([]);

  const handleSelect = useCallback((member) => setSelectedMember(member), []);
  const handleClose  = useCallback(() => setSelectedMember(null), []);

  const total = foundingTeam.length + opsTeam.length;

  useEffect(() => {
    const observers = [];
    cardRefs.current.forEach((el, i) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            setVisibleSet((prev) => {
              const next = new Set(prev);
              next.add(i);
              return next;
            });
            obs.disconnect();
          }
        },
        { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [foundingTeam, opsTeam]);

  if (total === 0) {
    return (
      <section className="tm-section">
        <div className="tm-container">
          <div className="tm-empty">
            <span className="tm-empty-icon">👥</span>
            <p className="tm-empty-text">Team profiles coming soon.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      {/* ── HERO SECTION with Org Chart SVG ── */}
      <section className="tm-hero" aria-label="Team hero">
        <div className="tm-hero-content">
          <p className="tm-hero-kicker">{heroKicker ?? 'The People Behind the Mission'}</p>
          <h1 className="tm-hero-title">
            {heroTitle
              ? heroTitle
              : <>Meet Our <em>Team</em></>
            }
          </h1>
          <p className="tm-hero-desc">
            {heroContent ?? 'Passionate young leaders and dedicated professionals working across borders to drive lasting change for youth across South Asia and beyond.'}
          </p>
        </div>
        <div className="tm-hero-graphic" aria-hidden="true">
          <svg viewBox="0 0 600 600" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <style>{`
              @keyframes tm-slowSpin {
                from { transform: rotate(0deg); }
                to   { transform: rotate(360deg); }
              }
              @keyframes tm-pulse {
                0%, 100% { opacity: 0.6; transform: scale(1); }
                50%       { opacity: 1;   transform: scale(1.15); }
              }
              .tm-svg-outer { transform-origin: 300px 300px; animation: tm-slowSpin 60s linear infinite; }
              .tm-svg-pulse { transform-origin: 300px 300px; animation: tm-pulse 3s ease-in-out infinite; }
            `}</style>

            {/* Large faint enclosing circle */}
            <circle cx="300" cy="300" r="265" fill="none" stroke="rgba(201,168,76,0.06)" strokeWidth="1"/>

            {/* Outermost ring — slow spin */}
            <g className="tm-svg-outer">
              <circle cx="300" cy="300" r="265" fill="none" stroke="rgba(201,168,76,0.18)" strokeWidth="1"/>
              <circle cx="300" cy="35" r="3" fill="rgba(201,168,76,0.3)"/>
              <circle cx="300" cy="565" r="3" fill="rgba(201,168,76,0.3)"/>
              <circle cx="35" cy="300" r="3" fill="rgba(201,168,76,0.3)"/>
              <circle cx="565" cy="300" r="3" fill="rgba(201,168,76,0.3)"/>
            </g>

            {/* Horizontal dashed mid-tier separator */}
            <line x1="120" y1="210" x2="480" y2="210" stroke="rgba(201,168,76,0.18)" strokeWidth="0.9" strokeDasharray="6 8"/>

            {/* Connecting lines — top node to tier 2 */}
            <line x1="300" y1="148" x2="180" y2="250" stroke="rgba(201,168,76,0.20)" strokeWidth="0.9"/>
            <line x1="300" y1="148" x2="300" y2="250" stroke="rgba(201,168,76,0.20)" strokeWidth="0.9"/>
            <line x1="300" y1="148" x2="420" y2="250" stroke="rgba(201,168,76,0.20)" strokeWidth="0.9"/>

            {/* Connecting lines — tier 2 to tier 3 left branch */}
            <line x1="180" y1="278" x2="130" y2="370" stroke="rgba(201,168,76,0.15)" strokeWidth="0.8"/>
            <line x1="180" y1="278" x2="200" y2="370" stroke="rgba(201,168,76,0.15)" strokeWidth="0.8"/>

            {/* Connecting lines — tier 2 to tier 3 center branch */}
            <line x1="300" y1="278" x2="270" y2="370" stroke="rgba(201,168,76,0.15)" strokeWidth="0.8"/>
            <line x1="300" y1="278" x2="330" y2="370" stroke="rgba(201,168,76,0.15)" strokeWidth="0.8"/>

            {/* Connecting lines — tier 2 to tier 3 right branch */}
            <line x1="420" y1="278" x2="390" y2="370" stroke="rgba(201,168,76,0.15)" strokeWidth="0.8"/>
            <line x1="420" y1="278" x2="460" y2="370" stroke="rgba(201,168,76,0.15)" strokeWidth="0.8"/>
            <line x1="420" y1="278" x2="430" y2="430" stroke="rgba(201,168,76,0.12)" strokeWidth="0.8"/>

            {/* Tier 2 nodes — 3 dept heads r=8 */}
            <circle cx="180" cy="264" r="8" fill="none" stroke="rgba(201,168,76,0.35)" strokeWidth="1.2"/>
            <circle cx="180" cy="264" r="5" fill="rgba(201,168,76,0.3)" filter="drop-shadow(0 0 5px rgba(201,168,76,0.5))"/>
            <circle cx="300" cy="264" r="8" fill="none" stroke="rgba(201,168,76,0.35)" strokeWidth="1.2"/>
            <circle cx="300" cy="264" r="5" fill="rgba(201,168,76,0.3)" filter="drop-shadow(0 0 5px rgba(201,168,76,0.5))"/>
            <circle cx="420" cy="264" r="8" fill="none" stroke="rgba(201,168,76,0.35)" strokeWidth="1.2"/>
            <circle cx="420" cy="264" r="5" fill="rgba(201,168,76,0.3)" filter="drop-shadow(0 0 5px rgba(201,168,76,0.5))"/>

            {/* Tier 3 nodes — small team members r=5 */}
            {[130, 200, 270, 330, 390, 460].map((x, i) => (
              <circle key={i} cx={x} cy="382" r="5" fill="rgba(201,168,76,0.25)" filter="drop-shadow(0 0 4px rgba(201,168,76,0.4))"/>
            ))}
            {/* Extra tier 3 node */}
            <circle cx="430" cy="442" r="5" fill="rgba(201,168,76,0.20)" filter="drop-shadow(0 0 4px rgba(201,168,76,0.35))"/>

            {/* Top leader node — r=12, pulsing glow */}
            <circle cx="300" cy="148" r="18" fill="none" stroke="rgba(201,168,76,0.20)" strokeWidth="1"/>
            <circle cx="300" cy="148" r="12" fill="none" stroke="rgba(201,168,76,0.35)" strokeWidth="1.2"/>
            <g className="tm-svg-pulse">
              <circle cx="300" cy="148" r="7" fill="#c9a84c" filter="drop-shadow(0 0 12px rgba(201,168,76,0.9))"/>
            </g>
          </svg>
        </div>
      </section>

      <TeamSection
        members={foundingTeam}
        title="Founding Leadership Team"
        subtitle="The visionaries who started it all"
        icon={<Globe2 size={20} color="rgba(232,220,200,0.8)" />}
        altBg={false}
        startIndex={0}
        visibleSet={visibleSet}
        cardRefs={cardRefs}
        refOffset={0}
        onSelect={handleSelect}
      />

      {opsTeam.length > 0 && (
        <TeamSection
          members={opsTeam}
          title="Global Operations & Management Team"
          subtitle="Our dedicated team members working across borders to drive impact worldwide."
          icon={<Users2 size={20} color="rgba(200,167,94,0.9)" />}
          altBg={true}
          startIndex={foundingTeam.length}
          visibleSet={visibleSet}
          cardRefs={cardRefs}
          refOffset={foundingTeam.length}
          onSelect={handleSelect}
        />
      )}

      <section className="tm-cta">
        <div className="tm-container">
          <div className="tm-cta-eyebrow">Join Us</div>
          <h2 className="tm-cta-title">{ctaTitle ?? 'Want to Join Our Team?'}</h2>
          <p className="tm-cta-desc">
            We&apos;re always looking for passionate young people to help us build
            something meaningful across South Asia.
          </p>
          <div className="tm-cta-actions">
            <a href="/get-involved" className="tm-cta-btn tm-cta-btn-primary">Apply Now</a>
            <a href="/about"        className="tm-cta-btn tm-cta-btn-ghost">Learn About Us</a>
          </div>
        </div>
      </section>

      <ProfileModal member={selectedMember} onClose={handleClose} />
    </>
  );
}