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
        <div className="gi-hero-text">
          <h1>{s.gi_hero_title ?? 'Be the Change You Want to See'}</h1>
          <p>{s.gi_hero_content ?? 'Join YouthVerse Union as a Volunteer or Ambassador and transform your vision into real systemic impact.'}</p>
        </div>
        <div className="gi-hero-graphic" aria-hidden="true">
          <svg viewBox="0 0 600 600" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <style>{`
              @keyframes gi-slowSpin {
                from { transform: rotate(0deg); }
                to   { transform: rotate(360deg); }
              }
              @keyframes gi-pulse {
                0%, 100% { opacity: 0.6; transform: scale(1); }
                50%       { opacity: 1;   transform: scale(1.15); }
              }
              @keyframes gi-orbit {
                from { offset-distance: 0%; }
                to   { offset-distance: 100%; }
              }
              .gi-svg-outer { transform-origin: 300px 300px; animation: gi-slowSpin 60s linear infinite; }
              .gi-svg-rev   { transform-origin: 300px 300px; animation: gi-slowSpin 40s linear infinite reverse; }
              .gi-svg-pulse { transform-origin: 300px 300px; animation: gi-pulse 3s ease-in-out infinite; }
            `}</style>

            {/* Radiating energy lines from center outward to hexagon vertices */}
            {[0,60,120,180,240,300].map((angle, i) => {
              const rad = angle * Math.PI / 180;
              return (
                <line
                  key={i}
                  x1="300" y1="300"
                  x2={parseFloat((300 + Math.cos(rad) * 80).toFixed(4))}
                  y2={parseFloat((300 + Math.sin(rad) * 80).toFixed(4))}
                  stroke="rgba(240,180,41,0.15)"
                  strokeWidth="1"
                />
              );
            })}

            {/* Outermost full ring — slow spin */}
            <g className="gi-svg-outer">
              <circle cx="300" cy="300" r="260" fill="none" stroke="rgba(240,180,41,0.25)" strokeWidth="1.2"/>
              <circle cx="300" cy="40" r="3.5" fill="rgba(240,180,41,0.4)"/>
              <circle cx="300" cy="560" r="3.5" fill="rgba(240,180,41,0.4)"/>
              <circle cx="40" cy="300" r="3.5" fill="rgba(240,180,41,0.4)"/>
              <circle cx="560" cy="300" r="3.5" fill="rgba(240,180,41,0.4)"/>
            </g>

            {/* Ring 3 — gap on right (open portal) */}
            <circle cx="300" cy="300" r="190"
              fill="none"
              stroke="rgba(240,180,41,0.22)"
              strokeWidth="1"
              strokeDasharray="252 48"
              strokeDashoffset="-24"
            />

            {/* Ring 2 — gap on right, counter-rotation */}
            <g className="gi-svg-rev">
              <circle cx="300" cy="300" r="140"
                fill="none"
                stroke="rgba(240,180,41,0.18)"
                strokeWidth="0.9"
                strokeDasharray="186 34"
                strokeDashoffset="-17"
              />
            </g>

            {/* Ring 1 around hexagon — gap on right */}
            <circle cx="300" cy="300" r="100"
              fill="none"
              stroke="rgba(240,180,41,0.16)"
              strokeWidth="0.9"
              strokeDasharray="131 24"
              strokeDashoffset="-12"
            />

            {/* Hexagon */}
            <polygon
              points="300,220 369,260 369,340 300,380 231,340 231,260"
              fill="none"
              stroke="rgba(240,180,41,0.45)"
              strokeWidth="1.2"
            />

            {/* Gold dots at hexagon vertices */}
            {[
              [300,220],[369,260],[369,340],
              [300,380],[231,340],[231,260]
            ].map(([x,y], i) => (
              <circle key={i} cx={x} cy={y} r="4" fill="#f0b429" filter="drop-shadow(0 0 6px rgba(240,180,41,0.7))"/>
            ))}

            {/* Arrow pointing upper-right — built from 3 thin lines */}
            {/* Shaft */}
            <line x1="270" y1="330" x2="330" y2="270" stroke="rgba(240,180,41,0.60)" strokeWidth="1.4"/>
            <line x1="330" y1="270" x2="305" y2="270" stroke="rgba(240,180,41,0.60)" strokeWidth="1.4"/>
            <line x1="330" y1="270" x2="330" y2="295" stroke="rgba(240,180,41,0.60)" strokeWidth="1.4"/>

            {/* Central focal pulse */}
            <g className="gi-svg-pulse">
              <circle cx="300" cy="300" r="6" fill="#f0b429" filter="drop-shadow(0 0 10px rgba(240,180,41,0.9))"/>
            </g>
          </svg>
        </div>
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