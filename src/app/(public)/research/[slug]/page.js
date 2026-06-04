export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Download, ExternalLink, ArrowLeft, Tag, Calendar, User } from 'lucide-react';
import './research-detail.css';

/* ── Metadata ─────────────────────────────────────────── */
export async function generateMetadata({ params }) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('research')
    .select('title, abstract')
    .eq('slug', params.slug)
    .eq('is_published', true)
    .single();

  if (!data) return { title: 'Research Not Found' };
  return {
    title: data.title,
    description: data.abstract ? data.abstract.substring(0, 160) : '',
  };
}

/* ── Helpers ──────────────────────────────────────────── */
function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : parts[0][0].toUpperCase();
}

/* ── Page ─────────────────────────────────────────────── */
export default async function ResearchDetailPage({ params }) {
  const supabase = await createClient();

  const { data: item, error } = await supabase
    .from('research')
    .select('*')
    .eq('slug', params.slug)
    .eq('is_published', true)
    .single();

  if (error || !item) notFound();

  const authors = Array.isArray(item.authors) ? item.authors.filter((a) => a.name) : [];
  const tags    = Array.isArray(item.tags)    ? item.tags.filter(Boolean)           : [];
  const dateStr = formatDate(item.published_at);
  const pdfUrl  = item.pdf_url || item.file_url;

  return (
    <main className="rd2-page">

      {/* ── Back ── */}
      <div className="rd2-topbar">
        <div className="rd2-container">
          <Link href="/research" className="rd2-back">
            <ArrowLeft size={15} />
            Back to Research
          </Link>
        </div>
      </div>

      {/* ── Hero ── */}
      <section className="rd2-hero">
        <div className="rd2-container">
          <div className="rd2-badges">
            {item.category && (
              <span className="rd2-badge rd2-badge-category">{item.category}</span>
            )}
            {item.status && item.status !== 'Draft' && (
              <span className="rd2-badge rd2-badge-status">{item.status}</span>
            )}
          </div>
          <h1 className="rd2-title">{item.title}</h1>
          {dateStr && (
            <p className="rd2-date">
              <Calendar size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
              Published {dateStr}
            </p>
          )}
        </div>
      </section>

      {/* ── Body ── */}
      <div className="rd2-container rd2-body">

        {/* ── Main content ── */}
        <div className="rd2-main">

          {/* Abstract */}
          {item.abstract && (
            <section className="rd2-section">
              <h2 className="rd2-section-title">Abstract</h2>
              <div className="rd2-abstract">
                {item.abstract.split('\n').map((para, i) =>
                  para.trim() ? <p key={i}>{para}</p> : null
                )}
              </div>
            </section>
          )}

          {/* Authors */}
          {authors.length > 0 && (
            <section className="rd2-section">
              <h2 className="rd2-section-title">Authors</h2>
              <div className="rd2-authors-grid">
                {authors.map((author, i) => (
                  <div key={i} className="rd2-author-card">
                    <div className="rd2-author-avatar">
                      {getInitials(author.name)}
                    </div>
                    <div className="rd2-author-info">
                      <div className="rd2-author-name">{author.name}</div>
                      {author.role        && <div className="rd2-author-role">{author.role}</div>}
                      {author.affiliation && <div className="rd2-author-affil">{author.affiliation}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <section className="rd2-section">
              <h2 className="rd2-section-title">Tags</h2>
              <div className="rd2-tags">
                {tags.map((tag, i) => (
                  <span key={i} className="rd2-tag">
                    <Tag size={11} />
                    {tag}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* ── Sidebar ── */}
        <aside className="rd2-sidebar">

          {/* Action bar */}
          {(pdfUrl || item.external_url) && (
            <div className="rd2-card">
              <h3 className="rd2-card-title">Access Paper</h3>
              <div className="rd2-link-btns">
                {pdfUrl && (
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rd2-link-btn rd2-link-btn-primary"
                  >
                    <Download size={15} />
                    Download PDF
                  </a>
                )}
                {item.external_url && (
                  <a
                    href={item.external_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rd2-link-btn rd2-link-btn-secondary"
                  >
                    <ExternalLink size={15} />
                    View Online
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Details */}
          <div className="rd2-card">
            <h3 className="rd2-card-title">Details</h3>
            <div className="rd2-details">
              {item.category && (
                <div className="rd2-detail-row">
                  <span className="rd2-detail-label">Category</span>
                  <span className="rd2-detail-value">{item.category}</span>
                </div>
              )}
              {dateStr && (
                <div className="rd2-detail-row">
                  <span className="rd2-detail-label">Published</span>
                  <span className="rd2-detail-value">{dateStr}</span>
                </div>
              )}
              {item.status && (
                <div className="rd2-detail-row">
                  <span className="rd2-detail-label">Status</span>
                  <span className="rd2-detail-value">{item.status}</span>
                </div>
              )}
              {authors.length > 0 && (
                <div className="rd2-detail-row">
                  <span className="rd2-detail-label">
                    {authors.length === 1 ? 'Author' : 'Authors'}
                  </span>
                  <span className="rd2-detail-value">
                    {authors.map((a) => a.name).join(', ')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}