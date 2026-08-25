export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  Download,
  ExternalLink,
  ArrowLeft,
  Tag,
  Calendar,
} from 'lucide-react';
import './research-detail.css';

/* ─────────────────────────────────────────────
   Metadata
───────────────────────────────────────────── */
export async function generateMetadata({ params }) {
  const { slug } = await params;

  const supabase = await createClient();

  const { data } = await supabase
    .from('research')
    .select('title, abstract')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (!data) {
    return {
      title: 'Research Not Found',
    };
  }

  return {
    title: data.title,
    description: data.abstract
      ? data.abstract.substring(0, 160)
      : '',
  };
}

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */

function formatDate(dateStr) {
  if (!dateStr) return null;

  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function getInitials(name) {
  if (!name) return '?';

  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length >= 2) {
    return (
      parts[0][0] +
      parts[parts.length - 1][0]
    ).toUpperCase();
  }

  return parts[0][0].toUpperCase();
}

/*
 * Normalize authors coming from Supabase.
 *
 * Supports:
 * 1. JSON array
 * 2. JSON string containing an array
 * 3. Single author object
 * 4. Array of strings
 * 5. Legacy `author`, `writer`, or `researcher` fields
 */
function normalizeAuthors(value, fallbackAuthor) {
  let normalized = value;

  /* JSON string */
  if (typeof normalized === 'string') {
    try {
      normalized = JSON.parse(normalized);
    } catch {
      /*
       * If the value is simply a person's name,
       * treat it as a single author.
       */
      normalized = normalized.trim()
        ? [
            {
              name: normalized.trim(),
              role: '',
              affiliation: '',
            },
          ]
        : [];
    }
  }

  /* Array */
  if (Array.isArray(normalized)) {
    return normalized
      .map((author) => {
        /* Array of strings */
        if (typeof author === 'string') {
          return {
            name: author.trim(),
            role: '',
            affiliation: '',
          };
        }

        /* Array of author objects */
        if (
          author &&
          typeof author === 'object'
        ) {
          return {
            name: String(
              author.name ??
              author.full_name ??
              author.fullName ??
              ''
            ).trim(),

            role: String(
              author.role ?? ''
            ).trim(),

            affiliation: String(
              author.affiliation ?? ''
            ).trim(),
          };
        }

        return null;
      })
      .filter((author) => author?.name);
  }

  /* Wrapped object:
     { authors: [...] }
  */
  if (
    normalized &&
    typeof normalized === 'object'
  ) {
    if (Array.isArray(normalized.authors)) {
      return normalizeAuthors(
        normalized.authors,
        fallbackAuthor
      );
    }

    /* Single author object */
    if (
      normalized.name ||
      normalized.full_name ||
      normalized.fullName
    ) {
      return normalizeAuthors(
        [normalized],
        fallbackAuthor
      );
    }
  }

  /*
   * Backwards compatibility:
   * If the database uses a singular author field.
   */
  if (fallbackAuthor) {
    return normalizeAuthors(
      fallbackAuthor,
      null
    );
  }

  return [];
}

/* ─────────────────────────────────────────────
   Page
───────────────────────────────────────────── */

export default async function ResearchDetailPage({
  params,
}) {
  const { slug } = await params;

  const supabase = await createClient();

  const {
    data: item,
    error,
  } = await supabase
    .from('research')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  /* Research not found */
  if (error || !item) {
    if (error) {
      console.error(
        'Research detail fetch error:',
        error.message
      );
    }

    notFound();
  }

  /*
   * IMPORTANT:
   * Read authors from the same `authors`
   * column that the admin panel saves.
   */
  const authors = normalizeAuthors(
    item.authors,
    item.author ??
      item.writer ??
      item.researcher
  );

  const tags =
    Array.isArray(item.tags)
      ? item.tags.filter(Boolean)
      : [];

  const dateStr = formatDate(
    item.published_at
  );

  const pdfUrl =
    item.pdf_url ||
    item.file_url;

  return (
    <main className="rd2-page">

      {/* ─────────────────────────────
          Back to Research
      ───────────────────────────── */}
      <div className="rd2-topbar">
        <div className="rd2-container">
          <Link
            href="/research"
            className="rd2-back"
          >
            <ArrowLeft size={15} />
            Back to Research
          </Link>
        </div>
      </div>

      {/* ─────────────────────────────
          Hero
      ───────────────────────────── */}
      <section className="rd2-hero">
        <div className="rd2-container">

          <div className="rd2-badges">

            {item.category && (
              <span className="rd2-badge rd2-badge-category">
                {item.category}
              </span>
            )}

            {item.status &&
              item.status !== 'Draft' && (
                <span className="rd2-badge rd2-badge-status">
                  {item.status}
                </span>
              )}

          </div>

          <h1 className="rd2-title">
            {item.title}
          </h1>

          {dateStr && (
            <p className="rd2-date">
              <Calendar
                size={14}
              />

              Published {dateStr}
            </p>
          )}

        </div>
      </section>

      {/* ─────────────────────────────
          Body
      ───────────────────────────── */}
      <div className="rd2-container rd2-body">

        {/* ─────────────────────────
            Main Content
        ───────────────────────── */}
        <div className="rd2-main">

          {/* Abstract */}
          {item.abstract && (
            <section className="rd2-section">

              <h2 className="rd2-section-title">
                Abstract
              </h2>

              <div className="rd2-abstract">

                {item.abstract
                  .split('\n')
                  .map((para, i) =>
                    para.trim() ? (
                      <p key={i}>
                        {para}
                      </p>
                    ) : null
                  )}

              </div>

            </section>
          )}

          {/* ─────────────────────────
              Authors
          ───────────────────────── */}
          {authors.length > 0 && (
            <section className="rd2-section">

              <h2 className="rd2-section-title">
                {authors.length === 1
                  ? 'Author'
                  : 'Authors'}
              </h2>

              <div className="rd2-authors-grid">

                {authors.map(
                  (author, i) => (
                    <div
                      key={i}
                      className="rd2-author-card"
                    >

                      <div className="rd2-author-avatar">
                        {getInitials(
                          author.name
                        )}
                      </div>

                      <div className="rd2-author-info">

                        <div className="rd2-author-name">
                          {author.name}
                        </div>

                        {author.role && (
                          <div className="rd2-author-role">
                            {author.role}
                          </div>
                        )}

                        {author.affiliation && (
                          <div className="rd2-author-affil">
                            {author.affiliation}
                          </div>
                        )}

                      </div>

                    </div>
                  )
                )}

              </div>

            </section>
          )}

          {/* ─────────────────────────
              Tags
          ───────────────────────── */}
          {tags.length > 0 && (
            <section className="rd2-section">

              <h2 className="rd2-section-title">
                Tags
              </h2>

              <div className="rd2-tags">

                {tags.map(
                  (tag, i) => (
                    <span
                      key={i}
                      className="rd2-tag"
                    >
                      <Tag size={11} />
                      {tag}
                    </span>
                  )
                )}

              </div>

            </section>
          )}

        </div>

        {/* ─────────────────────────
            Sidebar
        ───────────────────────── */}
        <aside className="rd2-sidebar">

          {/* Access Paper */}
          {(pdfUrl ||
            item.external_url) && (
            <div className="rd2-card">

              <h3 className="rd2-card-title">
                Access Paper
              </h3>

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

          {/* ─────────────────────────
              Details
          ───────────────────────── */}
          <div className="rd2-card">

            <h3 className="rd2-card-title">
              Details
            </h3>

            <div className="rd2-details">

              {/* Category */}
              {item.category && (
                <div className="rd2-detail-row">

                  <span className="rd2-detail-label">
                    Category
                  </span>

                  <span className="rd2-detail-value">
                    {item.category}
                  </span>

                </div>
              )}

              {/* Published */}
              {dateStr && (
                <div className="rd2-detail-row">

                  <span className="rd2-detail-label">
                    Published
                  </span>

                  <span className="rd2-detail-value">
                    {dateStr}
                  </span>

                </div>
              )}

              {/* Status */}
              {item.status && (
                <div className="rd2-detail-row">

                  <span className="rd2-detail-label">
                    Status
                  </span>

                  <span className="rd2-detail-value">
                    {item.status}
                  </span>

                </div>
              )}

              {/* ─────────────────────
                  AUTHOR FIX
              ───────────────────── */}
              {authors.length > 0 && (
                <div className="rd2-detail-row">

                  <span className="rd2-detail-label">
                    {authors.length === 1
                      ? 'Author'
                      : 'Authors'}
                  </span>

                  <span className="rd2-detail-value">
                    {authors
                      .map(
                        (author) =>
                          author.name
                      )
                      .join(', ')}
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