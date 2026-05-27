'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Search,
  Tag,
  Users,
  FileText,
  ExternalLink,
  Lightbulb,
  Globe2,
  ArrowRight,
} from 'lucide-react';

/* ── Helpers ───────────────────────────────────────────── */
function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function getAuthorDisplay(authors) {
  if (!Array.isArray(authors) || authors.length === 0) return null;
  const names = authors.map((a) => a.name).filter(Boolean);
  if (names.length === 0) return null;
  if (names.length <= 2) return names.join(', ');
  return `${names[0]}, ${names[1]} +${names.length - 2} more`;
}

/* ── Domain icon resolver ──────────────────────────────── */
function DomainIcon({ name }) {
  const map = {
    BookOpen: <BookOpen size={22} />,
    Lightbulb: <Lightbulb size={22} />,
    Globe2: <Globe2 size={22} />,
    Users: <Users size={22} />,
  };
  return map[name] || <BookOpen size={22} />;
}

/* ── Stat Counter ──────────────────────────────────────── */
function StatCounter({ target }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const animated = useRef(false);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animated.current) {
          animated.current = true;
          const start = performance.now();
          const duration = 1600;
          const ease = (t) => 1 - Math.pow(1 - t, 3);
          const tick = (now) => {
            const elapsed = Math.min((now - start) / duration, 1);
            setCount(Math.round(ease(elapsed) * target));
            if (elapsed < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref} className="rp-stat-number">{count}</span>;
}

/* ── 3D Tilt Card ──────────────────────────────────────── */
function TiltCard({ children, className }) {
  const ref = useRef(null);

  const onMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 8}deg) translateY(-6px)`;
  }, []);

  const onLeave = useCallback(() => {
    const el = ref.current;
    if (el) el.style.transform = '';
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </div>
  );
}

/* ── Scroll Reveal Hook ────────────────────────────────── */
function useScrollReveal(selector, stagger = 100) {
  useEffect(() => {
    const items = document.querySelectorAll(selector);
    if (!items.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const idx = parseInt(el.dataset.idx || '0', 10);
            setTimeout(() => {
              el.classList.add('rp-visible');
            }, idx * stagger);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    items.forEach((el, i) => {
      el.dataset.idx = i;
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [selector, stagger]);
}

/* ── Paper Card ────────────────────────────────────────── */
function PaperCard({ item, index }) {
  const href = item.slug ? `/research/${item.slug}` : '#';
  const authorStr = getAuthorDisplay(item.authors);
  const tags = Array.isArray(item.tags) ? item.tags.filter(Boolean) : [];
  const pdfUrl = item.pdf_url || item.file_url;

  return (
    <div className="rp-paper-card" data-idx={index}>
      {/* Top row */}
      <div className="rp-paper-top">
        {item.category && (
          <span className="rp-paper-category">{item.category}</span>
        )}
        {item.published_at && (
          <span className="rp-paper-date">{formatDate(item.published_at)}</span>
        )}
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="rp-paper-tags">
          {tags.map((t, i) => (
            <span key={i} className="rp-paper-tag">
              <Tag size={11} />
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Title */}
      <h3 className="rp-paper-title">{item.title}</h3>

      {/* Abstract */}
      {item.abstract && (
        <p className="rp-paper-abstract">{item.abstract}</p>
      )}

      {/* Authors */}
      {authorStr && (
        <div className="rp-paper-authors">
          <span className="rp-paper-authors-icon">
            <Users size={14} />
          </span>
          {authorStr}
        </div>
      )}

      {/* Action row */}
      <div className="rp-paper-actions">
        <Link href={href} className="rp-btn-gold">
          Read Paper <ArrowRight size={14} />
        </Link>
        {pdfUrl && (
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rp-btn-outline"
          >
            <FileText size={15} /> PDF
          </a>
        )}
        {item.external_url && (
          <a
            href={item.external_url}
            target="_blank"
            rel="noopener noreferrer"
            className="rp-btn-ghost"
          >
            <ExternalLink size={13} /> View Online
          </a>
        )}
      </div>
    </div>
  );
}

/* ── Main Component ────────────────────────────────────── */
export default function ResearchClient({ settings, research }) {
  const s = settings || {};
  const allPapers = research || [];
  const [query, setQuery] = useState('');

  /* Scroll reveal for paper cards */
  useScrollReveal('.rp-paper-card', 120);

  /* Filtered papers */
  const filtered = query.trim()
    ? allPapers.filter((p) => {
        const q = query.toLowerCase();
        return (
          (p.title || '').toLowerCase().includes(q) ||
          (p.abstract || '').toLowerCase().includes(q) ||
          (p.category || '').toLowerCase().includes(q) ||
          (Array.isArray(p.tags) && p.tags.some((t) => t.toLowerCase().includes(q))) ||
          (Array.isArray(p.authors) &&
            p.authors.some((a) => (a.name || '').toLowerCase().includes(q)))
        );
      })
    : allPapers;

  /* Settings */
  const heroTitle    = s['research_hero_title']      ?? 'Knowledge That\nMoves the World';
  const heroBadge    = s['research_hero_badge_text'] ?? 'Research & Publications';
  const heroDesc     = s['research_hero_content']    ?? 'Rigorous, evidence-based research driving meaningful change for young people worldwide.';
  const purposeLabel = s['research_intro_badge_text']?? 'Why Research Matters';
  const purposeTitle = s['research_intro_title']     ?? 'Research as a Tool for Change';
  const purposeBody  = s['research_intro_content']   ?? 'We believe data is a catalyst for justice. Our research informs policy, shapes discourse, and empowers youth advocates with the evidence they need to drive lasting reform.';
  const papersTitle  = s['research_papers_title']    ?? 'Our Research Papers';
  const ctaTitle     = s['research_cta_title']       ?? 'Contribute to Our Knowledge Base';
  const ctaDesc      = s['research_cta_content']     ?? 'Partner with us to produce research that challenges assumptions and creates new pathways for youth empowerment.';
  const ctaBtn1      = s['research_cta_btn_text']    ?? 'Browse Papers';
  const ctaBtn2      = s['research_cta_btn2_text']   ?? 'Get Involved';
  const ctaLink2     = s['research_cta_btn2_link']   ?? '/get-involved';

  /* Domain cards from settings or fallback */
  const fallbackDomains = [
    { icon: 'BookOpen',  title: 'Youth Policy',       text: 'Analyzing policies that shape youth futures' },
    { icon: 'Lightbulb', title: 'Innovation & Tech',  text: 'Tech-driven solutions for social problems' },
    { icon: 'Globe2',    title: 'Global Development', text: 'SDG-aligned research for developing nations' },
    { icon: 'Users',     title: 'Social Equity',      text: 'Research centered on inclusion and justice' },
  ];

  const domains = [1, 2, 3, 4].map((n) => ({
    icon:  s[`research_domain_${n}_icon`]  || fallbackDomains[n - 1].icon,
    title: s[`research_domain_${n}_title`] || fallbackDomains[n - 1].title,
    text:  s[`research_domain_${n}_text`]  || fallbackDomains[n - 1].text,
  }));

  /* Render title with line breaks */
  const titleLines = heroTitle.split('\n');

  return (
    <main>
      {/* ── HERO ── */}
      <section className="rp-hero">
        <div className="rp-hero-inner">
          <div className="rp-hero-badge">
            <BookOpen size={14} />
            {heroBadge}
          </div>
          <h1 className="rp-hero-title">
            {titleLines.map((line, i) => (
              <span key={i} style={{ display: 'block' }}>
                {i === 1 ? <span>{line}</span> : line}
              </span>
            ))}
          </h1>
          {heroDesc && <p className="rp-hero-desc">{heroDesc}</p>}
        </div>
      </section>

      {/* ── PURPOSE ── */}
      <section className="rp-purpose">
        <div className="rp-purpose-inner">
          {/* Left */}
          <div className="rp-purpose-text">
            <p className="rp-purpose-label">{purposeLabel}</p>
            <h2>{purposeTitle}</h2>
            <div className="rp-divider" />
            <p className="rp-purpose-body">{purposeBody}</p>
            <div className="rp-stat-badge">
              <StatCounter target={allPapers.length} />
              <span className="rp-stat-label">Research Papers</span>
            </div>
          </div>

          {/* Right — domain cards */}
          <div className="rp-domains">
            {domains.map((d, i) => (
              <TiltCard key={i} className="rp-domain-card">
                <div className="rp-domain-icon">
                  <DomainIcon name={d.icon} />
                </div>
                <p className="rp-domain-name">{d.title}</p>
                <p className="rp-domain-text">{d.text}</p>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── PAPERS ── */}
      <section className="rp-papers">
        <div className="rp-papers-inner">
          <div className="rp-papers-header">
            <p className="rp-papers-label">Publications</p>
            <h2 className="rp-papers-title">{papersTitle}</h2>
          </div>

          {/* Search */}
          <div className="rp-search-wrap">
            <span className="rp-search-icon">
              <Search size={18} />
            </span>
            <input
              className="rp-search-input"
              type="text"
              placeholder="Search by title, author, tag, or category…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {/* Grid */}
          <div className="rp-papers-grid">
            {filtered.length > 0 ? (
              filtered.map((paper, i) => (
                <PaperCard key={paper.id} item={paper} index={i} />
              ))
            ) : (
              <div className="rp-empty">
                <div className="rp-empty-icon">
                  <BookOpen size={28} />
                </div>
                <p className="rp-empty-text">No research papers found</p>
                <p className="rp-empty-sub">
                  {query ? 'Try a different search term.' : 'Check back soon.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="rp-cta">
        <div className="rp-cta-inner">
          <p className="rp-cta-label">Work With Us</p>
          <h2 className="rp-cta-title">{ctaTitle}</h2>
          {ctaDesc && <p className="rp-cta-desc">{ctaDesc}</p>}
          <div className="rp-cta-btns">
            <Link href="/research" className="rp-cta-btn-primary">
              {ctaBtn1} <ArrowRight size={16} />
            </Link>
            <Link href={ctaLink2} className="rp-cta-btn-ghost">
              {ctaBtn2}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}