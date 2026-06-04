// src/components/ui/Footer.js
import Link from 'next/link';

export default function Footer({ settings }) {
  const s = settings || {};
  const whatsappClean = (s.social_whatsapp || '').replace(/\D/g, '');

  function withHttps(url) {
    if (!url) return null;
    const trimmed = url.trim();
    if (!trimmed) return null;
    return /^https?:\/\//i.test(trimmed) ? trimmed : 'https://' + trimmed;
  }

  return (
    <footer className="site-footer">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

        .site-footer {
          background: #0d1422;
          color: #e8e0cc;
          padding: 70px 5% 0;
          font-family: 'Poppins', sans-serif;
        }

        .footer-content {
          max-width: 1300px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1.8fr 1.2fr 1.2fr 1.4fr;
          gap: 3rem;
          padding-bottom: 60px;
        }

        /* ── Brand column ── */
        .footer-logo-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 1rem;
        }
        .footer-logo-emblem {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: 2px solid #c9a84c;
          background: rgba(201,168,76,0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 1.3rem;
        }
        .footer-wordmark {
          font-size: 1.2rem;
          font-weight: 700;
          color: #e8e0cc;
          margin: 0;
          line-height: 1.2;
        }
        .footer-wordmark span { color: #c9a84c; }
        .footer-tagline-bold {
          font-size: 0.85rem;
          font-weight: 600;
          color: #c9a84c;
          margin: 0 0 0.3rem 0;
          letter-spacing: 0.3px;
        }
        .footer-tagline-sub {
          font-size: 0.82rem;
          color: rgba(232,224,204,0.55);
          font-weight: 300;
          margin: 0 0 1.5rem 0;
        }
        .footer-social-icons {
          display: flex;
          gap: 0.55rem;
          flex-wrap: wrap;
        }
        .footer-social-icons a {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: 8px;
          color: rgba(201,168,76,0.7);
          background: rgba(201,168,76,0.06);
          border: 1px solid rgba(201,168,76,0.18);
          text-decoration: none;
          transition: color 0.2s ease, background 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
          flex-shrink: 0;
        }
        .footer-social-icons a:hover {
          color: #c9a84c;
          background: rgba(201,168,76,0.14);
          border-color: rgba(201,168,76,0.45);
          transform: translateY(-2px);
        }
        .footer-social-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: 8px;
          color: rgba(201,168,76,0.2);
          background: rgba(201,168,76,0.03);
          border: 1px solid rgba(201,168,76,0.08);
          cursor: default;
        }

        /* ── Nav columns ── */
        .footer-col-label {
          font-size: 0.95rem;
          font-weight: 600;
          color: #c9a84c;
          margin: 0 0 1.2rem 0;
        }
        .footer-nav-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }
        .footer-nav-list a {
          font-size: 0.88rem;
          color: rgba(232,224,204,0.7);
          text-decoration: none;
          font-weight: 300;
          transition: color 0.2s ease;
        }
        .footer-nav-list a:hover { color: #e8e0cc; }

        /* ── Contact column ── */
        .footer-contact-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .footer-contact-list li {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }
        .footer-contact-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 1px solid rgba(201,168,76,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: #c9a84c;
          margin-top: 1px;
        }
        .footer-contact-text {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }
        .footer-contact-text a {
          font-size: 0.88rem;
          color: rgba(232,224,204,0.85);
          text-decoration: none;
          font-weight: 400;
          transition: color 0.2s ease;
          line-height: 1.4;
        }
        .footer-contact-text a:hover { color: #c9a84c; }
        .footer-contact-sub {
          font-size: 0.72rem;
          color: rgba(232,224,204,0.4);
          font-weight: 300;
        }
        .footer-join-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-top: 1.25rem;
          padding: 11px 22px;
          background: #c9a84c;
          color: #0d1422;
          font-size: 0.88rem;
          font-weight: 600;
          border-radius: 6px;
          text-decoration: none;
          transition: background 0.2s ease;
        }
        .footer-join-btn:hover { background: #b8943e; }
        .footer-join-btn svg { flex-shrink: 0; }

        /* ── Bottom bar ── */
        .footer-bottom {
          max-width: 1300px;
          margin: 0 auto;
          padding: 22px 0 28px;
          border-top: 1px solid rgba(201,168,76,0.12);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .footer-copyright {
          font-size: 0.78rem;
          color: rgba(232,224,204,0.4);
          font-weight: 300;
          margin: 0;
        }
        .footer-bottom-center {
          font-size: 0.78rem;
          color: rgba(232,224,204,0.4);
          font-weight: 300;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .footer-bottom-center .heart { color: #e05c6a; }
        .footer-bottom-right {
          font-size: 0.78rem;
          color: rgba(232,224,204,0.4);
          font-weight: 300;
        }

        @media (max-width: 1024px) {
          .footer-content {
            grid-template-columns: 1fr 1fr;
            gap: 2.5rem;
          }
          .footer-brand { grid-column: 1 / -1; }
        }
        @media (max-width: 600px) {
          .footer-content {
            grid-template-columns: 1fr;
            gap: 2rem;
            padding-bottom: 40px;
          }
          .footer-brand { grid-column: auto; }
          .footer-bottom {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }
        }
      `}</style>

      <div className="footer-content">

        {/* ── Brand ── */}
        <div className="footer-brand">
          <div className="footer-logo-row">
            <div className="footer-logo-emblem">⚜</div>
            <h4 className="footer-wordmark">YouthVerse <span>Union</span></h4>
          </div>
          <p className="footer-tagline-bold">
            {s.site_tagline_bold || 'Inspiring Minds Beyond Boundaries'}
          </p>
          <p className="footer-tagline-sub">
            {s.site_tagline || 'For the Youth. By the Youth.'}
          </p>
          {(() => {
            const waNum = (s.social_whatsapp || s.contact_whatsapp || '').replace(/\D/g, '');
            const socials = [
              {
                key: 'fb', href: withHttps(s.social_facebook), title: 'Facebook',
                icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>,
              },
              {
                key: 'ig', href: withHttps(s.social_instagram), title: 'Instagram',
                icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>,
              },
              {
                key: 'li', href: withHttps(s.social_linkedin), title: 'LinkedIn',
                icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>,
              },
              {
                key: 'wa', href: waNum ? `https://wa.me/${waNum}` : null, title: 'WhatsApp',
                icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M11.999 2C6.477 2 2 6.477 2 12c0 1.989.518 3.859 1.426 5.484L2 22l4.644-1.418A9.955 9.955 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 11.999 2zm.001 18c-1.72 0-3.322-.46-4.701-1.265l-.336-.2-3.49 1.065 1.036-3.408-.218-.35A7.955 7.955 0 0 1 4 12c0-4.418 3.582-8 8-8s8 3.582 8 8-3.582 8-8 8z"/></svg>,
              },
              {
                key: 'yt', href: withHttps(s.social_youtube), title: 'YouTube',
                icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>,
              },
            ];
            return (
              <div className="footer-social-icons">
                {socials.map(({ key, href, title, icon }) =>
                  href ? (
                    <a key={key} href={href} target="_blank" rel="noopener noreferrer" title={title}>{icon}</a>
                  ) : (
                    <span key={key} className="footer-social-placeholder" title={`${title} — not set`}>{icon}</span>
                  )
                )}
              </div>
            );
          })()}
        </div>

        {/* ── Quick Links ── */}
        <div>
          <h5 className="footer-col-label">Quick Links</h5>
          <ul className="footer-nav-list">
            <li><Link href="/">Home</Link></li>
            <li><Link href="/about">About Us</Link></li>
            <li><Link href="/events">Events</Link></li>
            <li><Link href="/research">Research</Link></li>
            <li><Link href="/get-involved">Get Involved</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
        </div>

        {/* ── Our Programs ── */}
        <div>
          <h5 className="footer-col-label">Our Programs</h5>
          <ul className="footer-nav-list">
            <li><Link href="/events?type=olympiad">Olympiads &amp; Competitions</Link></li>
            <li><Link href="/events?type=mindcrafter">MindCrafter Series</Link></li>
            <li><Link href="/research">Research Initiatives</Link></li>
            <li><Link href="/about#leadership">Youth Leadership</Link></li>
            <li><Link href="/events?type=innovation">Innovation Programs</Link></li>
          </ul>
        </div>

        {/* ── Contact Us ── */}
        <div>
          <h5 className="footer-col-label">Contact Us</h5>
          <ul className="footer-contact-list">
            <li>
              <div className="footer-contact-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </div>
              <div className="footer-contact-text">
                <a href={`mailto:${s.contact_email || 'youthverseunion@gmail.com'}`}>
                  {s.contact_email || 'youthverseunion@gmail.com'}
                </a>
              </div>
            </li>
            {s.social_whatsapp && (
              <li>
                <div className="footer-contact-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                </div>
                <div className="footer-contact-text">
                  <a href={`https://wa.me/${whatsappClean}`} target="_blank" rel="noopener noreferrer">
                    {s.social_whatsapp}
                  </a>
                  <span className="footer-contact-sub">WhatsApp Available</span>
                </div>
              </li>
            )}
            {s.contact_location && (
              <li>
                <div className="footer-contact-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
                <div className="footer-contact-text">
                  <span style={{ fontSize: '0.88rem', color: 'rgba(232,224,204,0.80)', fontWeight: 300 }}>
                    {s.contact_location}
                  </span>
                </div>
              </li>
            )}
          </ul>
          <a href="/get-involved" className="footer-join-btn">
            Join Us
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </a>
        </div>

      </div>

      {/* ── Bottom bar ── */}
      <div className="footer-bottom">
        <p className="footer-copyright">
          &copy; {new Date().getFullYear()} YouthVerse Union. All rights reserved.
        </p>
        <div className="footer-bottom-center">
          Made with <span className="heart">♥</span> for the Youth
        </div>
        <div className="footer-bottom-right">
          For the Youth. By the Youth.
        </div>
      </div>
    </footer>
  );
}