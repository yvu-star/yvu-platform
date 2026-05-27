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

/* ─── Profile Modal — "Anna Brenner / Mellene" style ─────── */
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

          {/* ── Portrait photo — 45% fixed height ── */}
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

          {/* ── Scrollable-free content column ── */}
          <div className="tm-modal-content">

            {/* Identity — beige bg strip */}
            <div className="tm-modal-identity">
              <div className="tm-modal-name-wrap">
                <div className="tm-modal-name-accent" />
                <h3 className="tm-modal-name">
                  <span style={{ fontWeight: 900 }}>{firstName}</span>
                  {restName && <> <span style={{ fontWeight: 400 }}>{restName}</span></>}
                </h3>
              </div>
              <div className="tm-modal-role-wrap">
                <div className="tm-modal-role">
                  <span className="tm-modal-name-dot" />
                  {member.role || 'Team Member'}
                </div>
              </div>
            </div>

            {/* Social grid */}
            <div className="tm-modal-social-grid">
              {socialLinks.length > 0
                ? socialLinks.map((link, idx) => (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className={
                        'tm-modal-social-item' +
                        (socialLinks.length === 1 || (socialLinks.length % 2 !== 0 && idx === socialLinks.length - 1)
                          ? ' full-width'
                          : '')
                      }
                    >
                      {link.icon}
                      <span>{link.label}</span>
                    </a>
                  ))
                : <span className="tm-modal-social-no-links">No social links available</span>
              }
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
export default function TeamClient({ foundingTeam = [], opsTeam = [], ctaTitle }) {
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