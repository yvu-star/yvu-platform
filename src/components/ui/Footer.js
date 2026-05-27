// src/components/ui/Footer.js
import Link from 'next/link';

export default function Footer({ settings }) {
  const s = settings || {};
  const whatsappClean = (s.contact_whatsapp || '').replace(/\D/g, '');

  return (
    <footer className="site-footer" style={{ background: 'var(--navy-deep)', color: 'white', padding: '3rem 2rem' }}>
      <div className="footer-content" style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '2rem' }}>
        
        {/* Brand context section */}
        <div className="footer-brand" style={{ flex: '1 1 300px' }}>
          <h4 style={{ color: 'var(--gold)', margin: '0 0 1rem', fontSize: '1.2rem' }}>YouthVerse Union</h4>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.88rem', lineHeight: '1.6' }}>
            {s.site_tagline || 'Empowering and connecting the future generations through synchronized spaces.'}
          </p>
        </div>

        {/* Contact panel */}
        <div className="footer-contact" style={{ flex: '1 1 250px' }}>
          <h4 style={{ color: 'var(--gold)', margin: '0 0 1rem', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Contact</h4>
          <p style={{ fontSize: '0.88rem', margin: '0 0 0.5rem' }}>
            <span>Email: </span>
            <a href={`mailto:${s.contact_email || 'youthverseunion@gmail.com'}`} style={{ color: 'var(--beige)', textDecoration: 'none' }}>
              {s.contact_email || 'youthverseunion@gmail.com'}
            </a>
          </p>
          {s.contact_whatsapp && (
            <p style={{ fontSize: '0.88rem', margin: '0' }}>
              <span>WhatsApp: </span>
              <a href={`https://wa.me/${whatsappClean}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--beige)', textDecoration: 'none' }}>
                {s.contact_whatsapp}
              </a>
            </p>
          )}
        </div>

        {/* Social Matrix Block using Inline SVGs */}
        <div className="footer-socials" style={{ flex: '1 1 200px' }}>
          <h4 style={{ color: 'var(--gold)', margin: '0 0 1rem', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Connect</h4>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {s.social_facebook && (
              <a href={s.social_facebook} target="_blank" rel="noopener noreferrer" style={{ color: 'white' }} title="Facebook">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>
            )}
            {s.social_instagram && (
              <a href={s.social_instagram} target="_blank" rel="noopener noreferrer" style={{ color: 'white' }} title="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
            )}
            {s.social_linkedin && (
              <a href={s.social_linkedin} target="_blank" rel="noopener noreferrer" style={{ color: 'white' }} title="LinkedIn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                  <rect x="2" y="9" width="4" height="12"/>
                  <circle cx="4" cy="4" r="2"/>
                </svg>
              </a>
            )}
          </div>
        </div>
        
      </div>
      <div className="footer-bottom" style={{ maxWidth: '1200px', margin: '2rem auto 0', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>
        &copy; {new Date().getFullYear()} YouthVerse Union. All rights reserved.
      </div>
    </footer>
  );
}