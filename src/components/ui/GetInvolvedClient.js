'use client';

import { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  Star, 
  ArrowUpRight 
} from 'lucide-react';

export default function GetInvolvedClient({
  settings,
  volunteerRole,
  ambassadorRole,
  volunteerCta,
  ambassadorCta,
}) {
  const s = settings || {};
  const [activeTab, setActiveTab] = useState('volunteer');

  // IntersectionObserver for scroll animations
  useEffect(function() {
    const observer = new IntersectionObserver(
      function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('gi-reveal-active');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    const animElements = document.querySelectorAll('.gi-reveal');
    animElements.forEach(function(el) {
      observer.observe(el);
    });

    return function() {
      observer.disconnect();
    };
  }, [activeTab]);

  // Parse arrays safely from JSONB configurations or text string fallbacks
  function getListItems(val) {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    return val.split('\n').map(item => item.trim()).filter(Boolean);
  }

  const volunteerResponsibilities = getListItems(volunteerRole?.responsibilities);
  const volunteerBenefits = getListItems(volunteerRole?.benefits);

  const ambassadorResponsibilities = getListItems(ambassadorRole?.responsibilities);
  const ambassadorBenefits = getListItems(ambassadorRole?.benefits);

  return (
    <main className="gi-main">
      {/* ── SECTION 1: HERO ── */}
      <section className="gi-hero gi-reveal">
        <h1>{s.gi_hero_title ?? 'Be the Change You Want to See'}</h1>
        <p>{s.gi_hero_content ?? 'Join YouthVerse Union as a Volunteer or Ambassador and transform your vision into real systemic impact.'}</p>
      </section>

      {/* ── SECTION 2: ROLE DETAILS (TAB SYSTEM) ── */}
      <section className="gi-role-section">
        <div className="gi-tab-row gi-reveal">
          <button 
            className={`gi-tab ${activeTab === 'volunteer' ? 'gi-tab-active' : ''}`}
            onClick={() => setActiveTab('volunteer')}
          >
            VOLUNTEER
          </button>
          <button 
            className={`gi-tab ${activeTab === 'ambassador' ? 'gi-tab-active' : ''}`}
            onClick={() => setActiveTab('ambassador')}
          >
            AMBASSADOR
          </button>
        </div>

        {/* VOLUNTEER VIEW */}
        {activeTab === 'volunteer' && (
          <div className="gi-role-container">
            <div className="gi-role-header gi-reveal">
              <h2>{s.gi_volunteer_title ?? volunteerRole?.title ?? 'Volunteer Role'}</h2>
              <div className="gi-commitment-row">
                <Clock size={16} />
                <span>{volunteerRole?.time_commitment ?? '5–10 hours/week'}</span>
              </div>
              {volunteerRole?.description && <p>{volunteerRole.description}</p>}
            </div>

            <div className="gi-lists-grid">
              {volunteerResponsibilities.length > 0 && (
                <div className="gi-list-column gi-reveal" style={{ transitionDelay: '100ms' }}>
                  <h3>Responsibilities</h3>
                  <ul>
                    {volunteerResponsibilities.map((item, idx) => (
                      <li key={idx}>
                        <CheckCircle2 size={16} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {volunteerBenefits.length > 0 && (
                <div className="gi-list-column gi-reveal" style={{ transitionDelay: '200ms' }}>
                  <h3>Benefits & Perks</h3>
                  <ul>
                    {volunteerBenefits.map((item, idx) => (
                      <li key={idx}>
                        <Star size={16} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="gi-apply-card gi-reveal">
              <h3>Ready to Volunteer?</h3>
              <p>Take the first step towards making a real difference.</p>
              {volunteerCta?.application_form_link ? (
                <a 
                  href={volunteerCta.application_form_link} 
                  className="gi-apply-btn" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <span>Apply Now</span>
                  <ArrowUpRight size={16} />
                </a>
              ) : (
                <button className="gi-apply-btn" disabled>
                  Applications Opening Soon
                </button>
              )}
            </div>
          </div>
        )}

        {/* AMBASSADOR VIEW */}
        {activeTab === 'ambassador' && (
          <div className="gi-role-container">
            <div className="gi-role-header gi-reveal">
              <h2>{s.gi_ambassador_title ?? ambassadorRole?.title ?? 'Ambassador Role'}</h2>
              <div className="gi-commitment-row">
                <Clock size={16} />
                <span>{ambassadorRole?.time_commitment ?? '5–10 hours/week'}</span>
              </div>
              {ambassadorRole?.description && <p>{ambassadorRole.description}</p>}
            </div>

            <div className="gi-lists-grid">
              {ambassadorResponsibilities.length > 0 && (
                <div className="gi-list-column gi-reveal" style={{ transitionDelay: '100ms' }}>
                  <h3>Responsibilities</h3>
                  <ul>
                    {ambassadorResponsibilities.map((item, idx) => (
                      <li key={idx}>
                        <CheckCircle2 size={16} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {ambassadorBenefits.length > 0 && (
                <div className="gi-list-column gi-reveal" style={{ transitionDelay: '200ms' }}>
                  <h3>Benefits & Perks</h3>
                  <ul>
                    {ambassadorBenefits.map((item, idx) => (
                      <li key={idx}>
                        <Star size={16} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="gi-apply-card gi-reveal">
              <h3>Ready to Become an Ambassador?</h3>
              <p>Take the first step towards making a real difference.</p>
              {ambassadorCta?.application_form_link ? (
                <a 
                  href={ambassadorCta.application_form_link} 
                  className="gi-apply-btn" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <span>Apply Now</span>
                  <ArrowUpRight size={16} />
                </a>
              ) : (
                <button className="gi-apply-btn" disabled>
                  Applications Opening Soon
                </button>
              )}
            </div>
          </div>
        )}
      </section>

      {/* ── SECTION 3: GLOBAL CTA FOOTER ── */}
      <section className="gi-questions gi-reveal">
        <h2>{s.gi_cta_title ?? 'Have Questions?'}</h2>
        <p>{s.gi_cta_subtitle ?? "Reach out to us — we're happy to help."}</p>
        <div className="gi-actions-row">
          <a href="/contact" className="gi-fill-btn">Contact Us</a>
          <a href="/about" className="gi-ghost-btn">Learn More</a>
        </div>
      </section>
    </main>
  );
}